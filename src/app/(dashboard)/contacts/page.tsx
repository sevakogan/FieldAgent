"use client";

import { useState, useMemo } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ClientProfileSheet } from "@/components/contacts/client-profile-sheet";
import { AddContactSheet } from "@/components/contacts/add-contact-sheet";
import { formatCurrency, LEAD_STATUS_STYLES } from "@/lib/utils";
import { LEADS, CLIENTS, KANBAN_COLUMNS } from "@/lib/mock-data";
import type { Lead, Client } from "@/types";

type Tab = "prospects" | "clients";

export default function ContactsPage() {
  const [tab, setTab] = useState<Tab>("prospects");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "board">("list");
  const [expandedLead, setExpandedLead] = useState<number | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [localLeads, setLocalLeads] = useState<readonly Lead[]>(LEADS);
  const [localClients, setLocalClients] = useState<readonly Client[]>(CLIENTS);

  const filteredLeads = useMemo(
    () => localLeads.filter((l) => l.name.toLowerCase().includes(search.toLowerCase())),
    [search, localLeads],
  );

  const filteredClients = useMemo(
    () => localClients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [search, localClients],
  );

  const handleAddProspect = (lead: Lead) => {
    setLocalLeads((prev) => [lead, ...prev]);
    setTab("prospects");
  };

  const handleAddClient = (client: Client) => {
    setLocalClients((prev) => [client, ...prev]);
    setTab("clients");
  };

  return (
    <>
      {/* Segmented Control + Search */}
      <div className="flex flex-col gap-3 mb-5">
        {/* Top row: segmented control + add button */}
        <div className="flex items-center justify-between gap-3">
          {/* Apple-style segmented control */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(["prospects", "clients"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-1.5 rounded-[7px] text-[13px] font-semibold border-none cursor-pointer transition-all capitalize ${
                  tab === t
                    ? "bg-white text-gray-900 shadow-sm"
                    : "bg-transparent text-gray-500"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            {tab === "prospects" && (
              <div className="hidden md:flex bg-gray-100 rounded-lg p-0.5">
                {(["list", "board"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-4 py-1.5 rounded-[7px] text-[13px] font-semibold border-none cursor-pointer transition-all capitalize ${
                      view === v
                        ? "bg-white text-gray-900 shadow-sm"
                        : "bg-transparent text-gray-500"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setAddSheetOpen(true)}
              className="bg-blue-500 text-white border-none rounded-full w-9 h-9 text-xl font-light cursor-pointer hover:bg-blue-600 transition-colors flex items-center justify-center shrink-0"
            >
              +
            </button>
          </div>
        </div>

        {/* Apple-style search bar */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-100 rounded-xl pl-9 pr-4 py-2.5 text-[15px] outline-none border-none placeholder:text-gray-400"
            placeholder="Search"
          />
        </div>
      </div>

      {/* Prospects Tab */}
      {tab === "prospects" && (
        <>
          {/* Board View (desktop only) */}
          {view === "board" && (
            <div className="hidden md:flex gap-3 overflow-x-auto pb-2 min-h-[300px]">
              {KANBAN_COLUMNS.map((col) => {
                const items = filteredLeads.filter((l) => l.status === col.id);
                return (
                  <div key={col.id} className="min-w-[200px] flex-1 bg-gray-50 rounded-2xl p-3">
                    <div className="flex justify-between items-center mb-3 px-1">
                      <span className="font-semibold text-[13px] text-gray-500 uppercase tracking-wide">
                        {col.label}
                      </span>
                      <span className="bg-gray-200/60 rounded-full px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                        {items.length}
                      </span>
                    </div>
                    {items.map((lead) => (
                      <KanbanCard
                        key={lead.id}
                        lead={lead}
                        expanded={expandedLead === lead.id}
                        onToggle={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* List View — always on mobile, shown on desktop when view=list */}
          <div className={view === "board" ? "md:hidden" : ""}>
            <div className="bg-white rounded-2xl overflow-hidden">
              {filteredLeads.map((lead, idx) => (
                <LeadRow key={lead.id} lead={lead} isLast={idx === filteredLeads.length - 1} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Clients Tab */}
      {tab === "clients" && (
        <div className="bg-white rounded-2xl overflow-hidden">
          {filteredClients.map((client, idx) => (
            <ClientRow
              key={client.id}
              client={client}
              onSelect={() => setSelectedClient(client)}
              isLast={idx === filteredClients.length - 1}
            />
          ))}
        </div>
      )}

      {/* Client Profile Bottom Sheet */}
      <ClientProfileSheet client={selectedClient} onClose={() => setSelectedClient(null)} />

      {/* Add Contact Sheet */}
      <AddContactSheet
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        onAddProspect={handleAddProspect}
        onAddClient={handleAddClient}
      />
    </>
  );
}

function KanbanCard({ lead, expanded, onToggle }: { readonly lead: Lead; readonly expanded: boolean; readonly onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer mb-2 hover:shadow-md transition-all"
    >
      <div className="font-semibold text-[15px] mb-0.5">
        {lead.name}
        {lead.es && <span className="text-[11px] ml-1">🇪🇸</span>}
      </div>
      <div className="text-[13px] text-gray-400 mb-3 leading-relaxed">{lead.service}</div>
      <div className="flex justify-between items-center">
        <span className="font-bold text-[15px]">
          {formatCurrency(lead.value)}
          <span className="text-[11px] text-gray-400 font-normal">/mo</span>
        </span>
        <span className="text-[11px] text-gray-400">{lead.ago}</span>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
          <button className="bg-green-50 text-green-700 border-none rounded-full px-3.5 py-1.5 text-[13px] font-semibold cursor-pointer">Call</button>
          <button className="bg-blue-50 text-blue-700 border-none rounded-full px-3.5 py-1.5 text-[13px] font-semibold cursor-pointer">SMS</button>
          <button className="bg-blue-500 text-white border-none rounded-full px-3.5 py-1.5 text-[13px] font-semibold cursor-pointer">Convert</button>
        </div>
      )}
    </div>
  );
}

function LeadRow({ lead, isLast }: { readonly lead: Lead; readonly isLast: boolean }) {
  return (
    <div className={`flex items-center gap-3.5 px-4 py-3 min-h-[52px] ${!isLast ? "border-b border-gray-100" : ""}`}>
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[15px] shrink-0">
        👤
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[15px]">
          {lead.name}
          {lead.es && <span className="text-[11px] ml-1">🇪🇸</span>}
        </div>
        <div className="text-[13px] text-gray-400 truncate">{lead.service}</div>
      </div>
      <div className="text-right shrink-0 flex items-center gap-2">
        <Badge variant={lead.status === "new" ? "success" : lead.status === "contacted" ? "info" : "warning"}>
          {lead.status}
        </Badge>
        <span className="font-bold text-[15px]">{formatCurrency(lead.value)}</span>
      </div>
    </div>
  );
}

function ClientRow({ client, onSelect, isLast }: { readonly client: Client; readonly onSelect: () => void; readonly isLast: boolean }) {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3.5 px-4 py-3 min-h-[52px] cursor-pointer active:bg-gray-50 transition-colors ${!isLast ? "border-b border-gray-100" : ""}`}
    >
      <Avatar initials={client.ini} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[17px] leading-tight mb-0.5">{client.name}</div>
        <div className="text-[13px] text-gray-400">{client.phone}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="flex items-center gap-1.5 justify-end mb-0.5">
          <span className="text-[13px] text-gray-400">{client.props} prop{client.props !== 1 ? "s" : ""}</span>
          <span className="text-gray-200">·</span>
          <span className="font-bold text-[15px]">{formatCurrency(client.mrr)}<span className="text-[11px] text-gray-400 font-normal">/mo</span></span>
        </div>
        {client.bal > 0 ? (
          <span className="text-[11px] text-red-500 font-semibold">{formatCurrency(client.bal)} due</span>
        ) : (
          <span className="text-[11px] text-green-500 font-medium">Paid</span>
        )}
      </div>
    </div>
  );
}
