"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ClientProfileSheet } from "@/components/contacts/client-profile-sheet";
import { AddContactSheet } from "@/components/contacts/add-contact-sheet";
import { formatCurrency, LEAD_STATUS_STYLES } from "@/lib/utils";
import { LEADS, CLIENTS, KANBAN_COLUMNS } from "@/lib/mock-data";
import type { Lead, Client } from "@/types";

type Tab = "prospects" | "clients";

export default function ContactsPage() {
  const router = useRouter();
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
      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex bg-white rounded-xl p-1 shadow-sm">
          {(["prospects", "clients"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-[10px] text-[13px] font-semibold border-none cursor-pointer transition-all capitalize ${
                tab === t ? "bg-brand-dark text-white" : "bg-transparent text-gray-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border border-gray-200 rounded-[10px] px-3.5 py-2 text-[13px] outline-none w-full sm:w-[200px]"
            placeholder={`Search ${tab}...`}
          />
          {tab === "prospects" && (
            <div className="hidden md:flex bg-white rounded-xl p-1 shadow-sm">
              {(["list", "board"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-1.5 rounded-[10px] text-[12px] font-semibold border-none cursor-pointer transition-all capitalize ${
                    view === v ? "bg-brand-dark text-white" : "bg-transparent text-gray-500"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setAddSheetOpen(true)}
            className="bg-brand-dark text-white border-none rounded-xl px-4 py-2 text-[13px] font-bold cursor-pointer hover:opacity-85 transition-opacity flex items-center gap-1.5 shrink-0"
          >
            <span className="text-lg leading-none">+</span>
            <span className="hidden sm:inline">Add Contact</span>
          </button>
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
                  <div key={col.id} className="min-w-[200px] flex-1 bg-gray-100 rounded-2xl p-3">
                    <div className="flex justify-between items-center mb-3 px-0.5">
                      <span className="font-bold text-xs text-gray-500">{col.label}</span>
                      <span className="bg-white rounded-full px-2 py-0.5 text-[11px] font-bold text-gray-500">
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
            <div className="flex flex-col gap-2">
              {filteredLeads.map((lead) => (
                <LeadRow key={lead.id} lead={lead} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Clients Tab */}
      {tab === "clients" && (
        <div className="flex flex-col gap-2">
          {filteredClients.map((client) => (
            <ClientRow key={client.id} client={client} onSelect={() => router.push(`/clients/${client.id}`)} />
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
      className="bg-white rounded-[14px] p-3.5 shadow-sm cursor-pointer mb-2 hover:shadow-md hover:-translate-y-px transition-all"
    >
      <div className="font-bold text-[13px] mb-0.5">
        {lead.name}
        {lead.es && <span className="text-[10px] ml-1">🇪🇸</span>}
      </div>
      <div className="text-[11px] text-gray-400 mb-2.5 leading-relaxed">{lead.service}</div>
      <div className="flex justify-between items-center">
        <span className="font-extrabold text-[13px]">
          {formatCurrency(lead.value)}
          <span className="text-[10px] text-gray-400 font-normal">/mo</span>
        </span>
        <span className="text-[10px] text-gray-400">{lead.ago}</span>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-1.5">
          <button className="bg-green-50 text-green-700 border-none rounded-lg px-2.5 py-1 text-[11px] font-semibold cursor-pointer">📞 Call</button>
          <button className="bg-blue-50 text-blue-700 border-none rounded-lg px-2.5 py-1 text-[11px] font-semibold cursor-pointer">💬 SMS</button>
          <button className="bg-brand-dark text-white border-none rounded-lg px-2.5 py-1 text-[11px] font-semibold cursor-pointer">Convert</button>
        </div>
      )}
    </div>
  );
}

function LeadRow({ lead }: { readonly lead: Lead }) {
  return (
    <Card className="flex items-center gap-3 cursor-pointer hover:shadow-md transition-all" padding="sm">
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-base shrink-0">👤</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[13px]">
          {lead.name}
          {lead.es && <span className="text-[10px] ml-1">🇪🇸</span>}
        </div>
        <div className="text-[11px] text-gray-400 truncate">{lead.service}</div>
      </div>
      <div className="text-right shrink-0 flex items-center gap-2">
        <Badge variant={lead.status === "new" ? "success" : lead.status === "contacted" ? "info" : "warning"}>
          {lead.status}
        </Badge>
        <span className="font-bold text-[13px]">{formatCurrency(lead.value)}</span>
      </div>
    </Card>
  );
}

function ClientRow({ client, onSelect }: { readonly client: Client; readonly onSelect: () => void }) {
  return (
    <div onClick={onSelect}>
      <Card className="flex items-center gap-3.5 cursor-pointer hover:shadow-md transition-all" padding="sm">
        <Avatar initials={client.ini} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-sm">{client.name}</span>
            {client.tag && (
              <span className="bg-yellow-50 text-yellow-700 rounded px-1.5 py-0.5 text-[10px] font-bold">
                {client.tag}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400">
            {client.phone} · {client.props} {client.props === 1 ? "property" : "properties"}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-black text-lg tracking-tight leading-none mb-1">
            {formatCurrency(client.mrr)}
            <span className="text-[11px] text-gray-400 font-normal">/mo</span>
          </div>
          {client.bal > 0 ? (
            <span className="text-[11px] text-red-600 font-bold">{formatCurrency(client.bal)} due</span>
          ) : (
            <span className="text-[11px] text-green-600 font-semibold">✓ Paid</span>
          )}
        </div>
      </Card>
    </div>
  );
}
