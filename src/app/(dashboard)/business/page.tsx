"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { Toggle } from "@/components/ui/toggle";
import { formatCurrency } from "@/lib/utils";
import { CLIENTS } from "@/lib/mock-data";

function OutstandingBreakdown({
  clients,
  onClose,
}: {
  readonly clients: ReadonlyArray<{ id: number; name: string; bal: number }>;
  readonly onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <Card padding="lg" className="w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-[15px] tracking-tight">Outstanding Breakdown</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors cursor-pointer"
          >
            &times;
          </button>
        </div>
        {clients
          .filter((c) => c.bal > 0)
          .sort((a, b) => b.bal - a.bal)
          .map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
            >
              <span className="text-[13px] font-medium text-gray-700">{client.name}</span>
              <span className="font-bold text-sm text-red-500">{formatCurrency(client.bal)}</span>
            </div>
          ))}
      </Card>
    </div>
  );
}

export default function BusinessPage() {
  const [showOutstanding, setShowOutstanding] = useState(false);

  const mrr = CLIENTS.reduce((sum, c) => sum + c.mrr, 0);
  const outstanding = CLIENTS.reduce((sum, c) => sum + c.bal, 0);
  const sortedClients = [...CLIENTS].sort((a, b) => b.mrr - a.mrr);

  return (
    <>
      {/* Outstanding Breakdown Modal */}
      {showOutstanding && (
        <OutstandingBreakdown
          clients={CLIENTS}
          onClose={() => setShowOutstanding(false)}
        />
      )}

      {/* Revenue Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="transition-all duration-200 hover:scale-[1.03] hover:shadow-md rounded-2xl cursor-pointer">
          <StatCard label="Recurring MRR" value={formatCurrency(mrr)} accent="Subscriptions" />
        </div>
        <div className="transition-all duration-200 hover:scale-[1.03] hover:shadow-md rounded-2xl cursor-pointer">
          <StatCard label="One-Time Jobs" value="$1,200" accent="This month" />
        </div>
        <div className="transition-all duration-200 hover:scale-[1.03] hover:shadow-md rounded-2xl cursor-pointer">
          <StatCard label="Total Collected" value="$3,180" accent="March 2026" />
        </div>
        <button
          type="button"
          onClick={() => setShowOutstanding(true)}
          className="text-left transition-all duration-200 hover:scale-[1.03] hover:shadow-md rounded-2xl cursor-pointer"
        >
          <StatCard label="Outstanding" value={formatCurrency(outstanding)} accent="To collect" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Top Clients */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-[15px] tracking-tight">Top Clients</h2>
            <Link
              href="/contacts"
              className="text-[11px] font-semibold text-brand hover:underline transition-colors cursor-pointer"
            >
              View All
            </Link>
          </div>
          {sortedClients.map((client, i) => (
            <Link
              key={client.id}
              href="/contacts"
              className="flex items-center gap-3.5 py-3 border-b border-gray-100 last:border-0 rounded-lg px-2 -mx-2 transition-all duration-150 hover:bg-gray-50 hover:shadow-sm cursor-pointer group"
            >
              <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500 shrink-0 group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                #{i + 1}
              </span>
              <Avatar initials={client.ini} />
              <div className="flex-1">
                <div className="font-semibold text-[13px] group-hover:text-brand transition-colors">{client.name}</div>
                <div className="text-[11px] text-gray-400">
                  {client.props} {client.props === 1 ? "property" : "properties"}
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-lg tracking-tight leading-none mb-0.5">
                  {formatCurrency(client.mrr)}
                  <span className="text-[11px] text-gray-400 font-normal">/mo</span>
                </div>
                <div className="text-[11px] text-gray-400">{formatCurrency(client.mrr * 12)}/yr</div>
              </div>
            </Link>
          ))}
        </Card>

        {/* Reviews + Smart Gate */}
        <div className="flex flex-col gap-4">
          {/* Review Stats */}
          <Card padding="lg">
            <h2 className="font-extrabold text-[15px] mb-4 tracking-tight">Reviews</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Overall", value: "4.8 ⭐", sub: "23 reviews" },
                { label: "Google",  value: "4.9 ⭐", sub: "18 reviews" },
                { label: "Yelp",    value: "4.6 ⭐", sub: "5 reviews" },
                { label: "Gate Rate", value: "94%",  sub: "Sent to public" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-gray-50 rounded-xl p-3 transition-all duration-150 hover:bg-gray-100 hover:shadow-sm cursor-pointer"
                >
                  <div className="text-[10px] font-semibold text-gray-400 tracking-wider mb-1">
                    {stat.label.toUpperCase()}
                  </div>
                  <div className="font-black text-lg">{stat.value}</div>
                  <div className="text-[10px] text-gray-400">{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Platforms */}
            <ReviewPlatforms />
          </Card>

          {/* Smart Gate */}
          <SmartGateCard />
        </div>
      </div>
    </>
  );
}

const PLATFORMS = [
  { icon: "🔵", name: "Google Business", url: "g.page/johns-lawn",    active: true },
  { icon: "🔴", name: "Yelp",            url: "yelp.com/biz/johns",   active: true },
  { icon: "🔵", name: "Facebook",         url: "Not connected",        active: false },
  { icon: "🟢", name: "Nextdoor",         url: "Not connected",        active: false },
] as const;

function ReviewPlatforms() {
  return (
    <>
      {PLATFORMS.map((platform) => (
        <div
          key={platform.name}
          className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 rounded-lg px-2 -mx-2 transition-all duration-150 hover:bg-gray-50 cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 transition-colors ${
                platform.active ? "bg-green-50" : "bg-gray-100"
              }`}
            >
              {platform.icon}
            </div>
            <div>
              <div className="font-semibold text-[13px]">{platform.name}</div>
              <div className={`text-[11px] ${platform.active ? "text-green-500" : "text-gray-400"}`}>
                {platform.url}
              </div>
            </div>
          </div>
          {platform.active ? (
            <span className="rounded-md px-2.5 py-1 text-[10px] font-bold bg-green-50 text-green-600 border border-green-200">
              Active
            </span>
          ) : (
            <button
              type="button"
              className="rounded-md px-2.5 py-1 text-[10px] font-bold bg-brand text-white hover:bg-brand/90 transition-colors cursor-pointer shadow-sm"
            >
              Connect
            </button>
          )}
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
  const [gates, setGates] = useState({
    afterJob: true,
    afterRenewal: false,
    gateActive: true,
    landingWidget: true,
  });

  const toggleGate = (key: keyof typeof gates) => {
    setGates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card padding="lg">
      <h2 className="font-extrabold text-[15px] mb-1.5">Smart Gate</h2>
      <p className="text-xs text-gray-400 mb-4 leading-relaxed">
        Low ratings go private. High ratings go to Google & Yelp automatically.
      </p>
      {GATE_OPTIONS.map((item) => (
        <div
          key={item.key}
          className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 rounded-lg px-2 -mx-2 transition-all duration-150 hover:bg-gray-50 cursor-pointer"
          onClick={() => toggleGate(item.key)}
        >
          <span className="text-[13px] font-medium text-gray-700">{item.label}</span>
          <Toggle checked={gates[item.key]} onChange={() => toggleGate(item.key)} />
        </div>
      ))}
    </Card>
  );
}
