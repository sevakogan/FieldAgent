"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { Toggle } from "@/components/ui/toggle";
import { formatCurrency } from "@/lib/utils";
import { getAuthContext } from "@/lib/db/auth";
import { getClients } from "@/lib/db/clients";
import { getInvoices } from "@/lib/db/invoices";
import type { Client, Invoice } from "@/types";

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function OutstandingBreakdown({
  clients,
  invoices,
  onClose,
}: {
  readonly clients: Client[];
  readonly invoices: Invoice[];
  readonly onClose: () => void;
}) {
  const clientOutstanding = clients.map((c) => ({
    ...c,
    bal: invoices
      .filter((inv) => inv.client_id === c.id && ["unpaid", "overdue", "partial"].includes(inv.status))
      .reduce((sum, inv) => sum + inv.total, 0),
  })).filter((c) => c.bal > 0).sort((a, b) => b.bal - a.bal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <Card padding="lg" className="w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-[15px] tracking-tight">Outstanding Breakdown</h3>
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer">
            &times;
          </button>
        </div>
        {clientOutstanding.length === 0 ? (
          <p className="text-gray-400 text-[13px] py-2">All clients are paid up! 🎉</p>
        ) : (
          clientOutstanding.map((client) => (
            <div key={client.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
              <span className="text-[13px] font-medium text-gray-700">{client.name}</span>
              <span className="font-bold text-sm text-red-500">{formatCurrency(client.bal)}</span>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

export default function BusinessPage() {
  const [showOutstanding, setShowOutstanding] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const auth = await getAuthContext();
      if (!auth) { setLoading(false); return; }
      const [c, inv] = await Promise.all([
        getClients(auth.companyId),
        getInvoices(auth.companyId),
      ]);
      setClients(c);
      setInvoices(inv);
      setLoading(false);
    })();
  }, []);

  const outstanding = invoices
    .filter((inv) => ["unpaid", "overdue", "partial"].includes(inv.status))
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalCollected = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0);

  const sortedClients = [...clients].sort((a, b) => a.name.localeCompare(b.name));

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="text-gray-400 animate-pulse">Loading...</div></div>;
  }

  return (
    <>
      {showOutstanding && (
        <OutstandingBreakdown clients={clients} invoices={invoices} onClose={() => setShowOutstanding(false)} />
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="transition-all duration-200 hover:scale-[1.03] hover:shadow-md rounded-2xl cursor-pointer">
          <StatCard label="Total Clients" value={String(clients.length)} accent="Active clients" />
        </div>
        <div className="transition-all duration-200 hover:scale-[1.03] hover:shadow-md rounded-2xl cursor-pointer">
          <StatCard label="Total Jobs" value="—" accent="This month" />
        </div>
        <div className="transition-all duration-200 hover:scale-[1.03] hover:shadow-md rounded-2xl cursor-pointer">
          <StatCard label="Total Collected" value={formatCurrency(totalCollected)} accent="All time" />
        </div>
        <button type="button" onClick={() => setShowOutstanding(true)} className="text-left transition-all duration-200 hover:scale-[1.03] hover:shadow-md rounded-2xl cursor-pointer">
          <StatCard label="Outstanding" value={formatCurrency(outstanding)} accent="To collect" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Top Clients */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-[15px] tracking-tight">All Clients</h2>
            <Link href="/contacts" className="text-[11px] font-semibold text-brand hover:underline cursor-pointer">View All</Link>
          </div>
          {sortedClients.length === 0 ? (
            <p className="text-gray-400 text-[13px] py-2">No clients yet. <Link href="/contacts" className="text-blue-500">Add your first client →</Link></p>
          ) : (
            sortedClients.map((client, i) => {
              const ini = getInitials(client.name);
              const clientOutstanding = invoices
                .filter((inv) => inv.client_id === client.id && ["unpaid", "overdue", "partial"].includes(inv.status))
                .reduce((sum, inv) => sum + inv.total, 0);

              return (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="flex items-center gap-3.5 py-3 border-b border-gray-100 last:border-0 rounded-lg px-2 -mx-2 transition-all duration-150 hover:bg-gray-50 hover:shadow-sm cursor-pointer group no-underline"
                >
                  <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500 shrink-0">
                    #{i + 1}
                  </span>
                  <Avatar initials={ini} />
                  <div className="flex-1">
                    <div className="font-semibold text-[13px] text-gray-900 group-hover:text-brand transition-colors">{client.name}</div>
                    <div className="text-[11px] text-gray-400">{client.phone ?? client.email ?? "—"}</div>
                  </div>
                  {clientOutstanding > 0 && (
                    <span className="text-[11px] font-bold text-red-500">{formatCurrency(clientOutstanding)} due</span>
                  )}
                </Link>
              );
            })
          )}
        </Card>

        {/* Reviews + Smart Gate */}
        <div className="flex flex-col gap-4">
          <Card padding="lg">
            <h2 className="font-extrabold text-[15px] mb-4 tracking-tight">Reviews</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Overall",    value: "—",   sub: "No reviews yet" },
                { label: "Google",     value: "—",   sub: "Connect below" },
                { label: "Yelp",       value: "—",   sub: "Connect below" },
                { label: "Gate Rate",  value: "—",   sub: "Pending setup" },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-[10px] font-semibold text-gray-400 tracking-wider mb-1">{stat.label.toUpperCase()}</div>
                  <div className="font-black text-lg">{stat.value}</div>
                  <div className="text-[10px] text-gray-400">{stat.sub}</div>
                </div>
              ))}
            </div>
            <ReviewPlatforms />
          </Card>

          <SmartGateCard />
        </div>
      </div>
    </>
  );
}

const PLATFORMS = [
  { icon: "🔵", name: "Google Business", url: "Connect to show link", active: false, href: "https://business.google.com" },
  { icon: "🔴", name: "Yelp",            url: "Connect to show link", active: false, href: "https://biz.yelp.com" },
  { icon: "🔵", name: "Facebook",        url: "Not connected",        active: false, href: "https://www.facebook.com/business" },
  { icon: "🟢", name: "Nextdoor",        url: "Not connected",        active: false, href: "https://business.nextdoor.com" },
] as const;

function ReviewPlatforms() {
  return (
    <>
      {PLATFORMS.map((platform) => (
        <div key={platform.name} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 rounded-lg px-2 -mx-2 transition-all duration-150 hover:bg-gray-50 cursor-pointer">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${platform.active ? "bg-green-50" : "bg-gray-100"}`}>
              {platform.icon}
            </div>
            <div>
              <div className="font-semibold text-[13px]">{platform.name}</div>
              <div className="text-[11px] text-gray-400">{platform.url}</div>
            </div>
          </div>
          <a href={platform.href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
            className="rounded-md px-2.5 py-1 text-[10px] font-bold bg-brand text-white hover:bg-brand/90 transition-colors cursor-pointer shadow-sm no-underline">
            Connect
          </a>
        </div>
      ))}
    </>
  );
}

const GATE_OPTIONS = [
  { key: "afterJob" as const,      label: "After completed job" },
  { key: "afterRenewal" as const,  label: "After monthly renewal" },
  { key: "gateActive" as const,    label: "Smart gate active" },
  { key: "landingWidget" as const, label: "Landing page widget" },
] as const;

function SmartGateCard() {
  const [gates, setGates] = useState({ afterJob: true, afterRenewal: false, gateActive: true, landingWidget: true });
  const toggleGate = (key: keyof typeof gates) => setGates((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <Card padding="lg">
      <h2 className="font-extrabold text-[15px] mb-1.5">Smart Gate</h2>
      <p className="text-xs text-gray-400 mb-4 leading-relaxed">Low ratings go private. High ratings go to Google &amp; Yelp automatically.</p>
      {GATE_OPTIONS.map((item) => (
        <div key={item.key} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 rounded-lg px-2 -mx-2 transition-all duration-150 hover:bg-gray-50 cursor-pointer"
          onClick={() => toggleGate(item.key)}>
          <span className="text-[13px] font-medium text-gray-700">{item.label}</span>
          <Toggle checked={gates[item.key]} onChange={() => toggleGate(item.key)} />
        </div>
      ))}
    </Card>
  );
}
