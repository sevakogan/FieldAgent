"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRealtime } from "@/hooks/useRealtime";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ClientProfileSheet } from "@/components/contacts/client-profile-sheet";
import { AddContactSheet } from "@/components/contacts/add-contact-sheet";
import { formatCurrency, LEAD_STATUS_STYLES } from "@/lib/utils";
import { getAuthContext } from "@/lib/db/auth";
import { getClients, createClientRecord } from "@/lib/db/clients";
import { getLeads, updateLeadStatus, deleteLead } from "@/lib/db/leads";
import type { Lead, Client, LeadStatus } from "@/types";

// Kanban columns (static config — no DB)
const KANBAN_COLUMNS = [
  { id: "new",       label: "New"       },
  { id: "contacted", label: "Contacted" },
  { id: "quoted",    label: "Quoted"    },
  { id: "won",       label: "Won"       },
  { id: "lost",      label: "Lost"      },
] as const;

type Tab = "prospects" | "clients";

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function ContactsPage() {
  const [tab, setTab] = useState<Tab>("prospects");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "board">("list");
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const auth = await getAuthContext();
      if (!auth) { setError("Not authenticated"); setLoading(false); return; }
      setCompanyId(auth.companyId);
      const [leadsData, clientsData] = await Promise.all([
        getLeads(auth.companyId),
        getClients(auth.companyId),
      ]);
      setLeads(leadsData);
      setClients(clientsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useRealtime(["leads", "clients"], companyId, loadData);

  const filteredLeads = useMemo(
    () => leads.filter((l) => l.name.toLowerCase().includes(search.toLowerCase())),
    [search, leads],
  );

  const filteredClients = useMemo(
    () => clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [search, clients],
  );

  const handleLeadStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const updated = await updateLeadStatus(leadId, newStatus);
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
    } catch (err) {
      console.error("Failed to update lead status:", err);
    }
  };

  const handleConvertToClient = async (lead: Lead) => {
    if (!companyId) return;
    try {
      await createClientRecord(companyId, {
        name: lead.name,
        phone: lead.phone ?? undefined,
      });
      await deleteLead(lead.id);
      setLeads((prev) => prev.filter((l) => l.id !== lead.id));
      setExpandedLead(null);
    } catch (err) {
      console.error("Failed to convert lead:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400 text-[15px]">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 rounded-2xl px-4 py-3 text-[14px]">{error}</div>
    );
  }

  return (
    <>
      {/* Segmented Control + Search */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(["prospects", "clients"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-1.5 rounded-[7px] text-[13px] font-semibold border-none cursor-pointer transition-all capitalize ${
                  tab === t ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500"
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
                      view === v ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500"
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

        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
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
          {view === "board" && (
            <div className="hidden md:flex gap-3 overflow-x-auto pb-2 min-h-[300px]">
              {KANBAN_COLUMNS.map((col) => {
                const items = filteredLeads.filter((l) => l.status === col.id);
                return (
                  <div key={col.id} className="min-w-[200px] flex-1 bg-gray-50 rounded-2xl p-3">
                    <div className="flex justify-between items-center mb-3 px-1">
                      <span className="font-semibold text-[13px] text-gray-500 uppercase tracking-wide">{col.label}</span>
                      <span className="bg-gray-200/60 rounded-full px-2 py-0.5 text-[11px] font-semibold text-gray-500">{items.length}</span>
                    </div>
                    {items.map((lead) => (
                      <KanbanCard
                        key={lead.id}
                        lead={lead}
                        expanded={expandedLead === lead.id}
                        onToggle={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                        onStatusChange={(status) => handleLeadStatusChange(lead.id, status)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          <div className={view === "board" ? "md:hidden" : ""}>
            <div className="bg-white rounded-2xl overflow-hidden">
              {filteredLeads.length === 0 ? (
                <p className="text-gray-400 text-[15px] px-4 py-6 text-center">No prospects yet. Tap + to add one.</p>
              ) : (
                filteredLeads.map((lead, idx) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    isLast={idx === filteredLeads.length - 1}
                    expanded={expandedLead === lead.id}
                    onToggle={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                    onConvert={() => handleConvertToClient(lead)}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Clients Tab */}
      {tab === "clients" && (
        <div className="bg-white rounded-2xl overflow-hidden">
          {filteredClients.length === 0 ? (
            <p className="text-gray-400 text-[15px] px-4 py-6 text-center">No clients yet. Tap + to add one.</p>
          ) : (
            filteredClients.map((client, idx) => (
              <ClientRow
                key={client.id}
                client={client}
                onSelect={() => setSelectedClient(client)}
                isLast={idx === filteredClients.length - 1}
              />
            ))
          )}
        </div>
      )}

      <ClientProfileSheet client={selectedClient} onClose={() => setSelectedClient(null)} />

      {companyId && (
        <AddContactSheet
          open={addSheetOpen}
          companyId={companyId}
          onClose={() => setAddSheetOpen(false)}
          onSuccess={loadData}
        />
      )}
    </>
  );
}

function KanbanCard({
  lead,
  expanded,
  onToggle,
  onStatusChange,
}: {
  readonly lead: Lead;
  readonly expanded: boolean;
  readonly onToggle: () => void;
  readonly onStatusChange: (status: LeadStatus) => void;
}) {
  return (
    <div onClick={onToggle} className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer mb-2 hover:shadow-md transition-all">
      <div className="font-semibold text-[15px] mb-0.5">
        {lead.name}
        {lead.spanish_speaker && <span className="text-[11px] ml-1">🇪🇸</span>}
      </div>
      <div className="text-[13px] text-gray-400 mb-3 leading-relaxed">{lead.service}</div>
      <div className="flex justify-between items-center">
        <span className="font-bold text-[15px]">
          {formatCurrency(lead.value)}
          <span className="text-[11px] text-gray-400 font-normal">/mo</span>
        </span>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onStatusChange("contacted"); }}
            className="bg-green-50 text-green-700 border-none rounded-full px-3.5 py-1.5 text-[13px] font-semibold cursor-pointer"
          >Call</button>
          <button
            onClick={(e) => { e.stopPropagation(); onStatusChange("quoted"); }}
            className="bg-blue-500 text-white border-none rounded-full px-3.5 py-1.5 text-[13px] font-semibold cursor-pointer"
          >Quote</button>
        </div>
      )}
    </div>
  );
}

function LeadRow({
  lead, isLast, expanded, onToggle, onConvert,
}: {
  readonly lead: Lead;
  readonly isLast: boolean;
  readonly expanded: boolean;
  readonly onToggle: () => void;
  readonly onConvert: () => void;
}) {
  return (
    <div
      className={`px-4 cursor-pointer active:bg-gray-50 transition-colors ${!isLast || expanded ? "border-b border-gray-100" : ""}`}
      onClick={onToggle}
    >
      <div className="flex items-center gap-3.5 py-3 min-h-[52px]">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[15px] shrink-0">👤</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[15px]">
            {lead.name}
            {lead.spanish_speaker && <span className="text-[11px] ml-1">🇪🇸</span>}
          </div>
          <div className="text-[13px] text-gray-400 truncate">{lead.service ?? "New inquiry"}</div>
        </div>
        <div className="text-right shrink-0 flex items-center gap-2">
          <Badge variant={lead.status === "new" ? "success" : lead.status === "contacted" ? "info" : "warning"}>
            {lead.status}
          </Badge>
          <span className="font-bold text-[15px]">{formatCurrency(lead.value)}</span>
        </div>
      </div>

      {expanded && (
        <div className="pb-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onConvert}
            className="flex items-center gap-1.5 bg-[#007AFF] text-white border-none rounded-full px-4 py-2 text-[13px] font-semibold cursor-pointer hover:opacity-85 transition-opacity"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            Convert to Client
          </button>
          <button
            onClick={() => onToggle()}
            className="bg-gray-100 text-gray-500 border-none rounded-full px-4 py-2 text-[13px] font-semibold cursor-pointer hover:bg-gray-200 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

function ClientRow({
  client,
  onSelect,
  isLast,
}: {
  readonly client: Client;
  readonly onSelect: () => void;
  readonly isLast: boolean;
}) {
  const ini = getInitials(client.name);

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3.5 px-4 py-3 min-h-[52px] cursor-pointer active:bg-gray-50 transition-colors ${!isLast ? "border-b border-gray-100" : ""}`}
    >
      <Avatar initials={ini} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[17px] leading-tight mb-0.5">{client.name}</div>
        <div className="text-[13px] text-gray-400">{client.phone ?? client.email ?? "—"}</div>
      </div>
      <div className="text-right shrink-0">
        {client.tag && (
          <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-[11px] font-medium">
            {client.tag}
          </span>
        )}
      </div>
    </div>
  );
}
