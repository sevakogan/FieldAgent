"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { Toggle } from "@/components/ui/toggle";
import { formatCurrency } from "@/lib/utils";
import { CLIENTS } from "@/lib/mock-data";

export default function BusinessPage() {
  const mrr = CLIENTS.reduce((sum, c) => sum + c.mrr, 0);
  const outstanding = CLIENTS.reduce((sum, c) => sum + c.bal, 0);
  const sortedClients = [...CLIENTS].sort((a, b) => b.mrr - a.mrr);

  return (
    <>
      {/* Revenue Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard label="Recurring MRR" value={formatCurrency(mrr)} accent="Subscriptions" />
        <StatCard label="One-Time Jobs" value="$1,200" accent="This month" />
        <StatCard label="Total Collected" value="$3,180" accent="March 2026" />
        <StatCard label="Outstanding" value={formatCurrency(outstanding)} accent="To collect" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Top Clients */}
        <Card padding="lg">
          <h2 className="font-extrabold text-[15px] mb-4 tracking-tight">Top Clients</h2>
          {sortedClients.map((client, i) => (
            <div
              key={client.id}
              className="flex items-center gap-3.5 py-3 border-b border-gray-100 last:border-0"
            >
              <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500 shrink-0">
                #{i + 1}
              </span>
              <Avatar initials={client.ini} />
              <div className="flex-1">
                <div className="font-semibold text-[13px]">{client.name}</div>
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
            </div>
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
                <div key={stat.label} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-[10px] font-semibold text-gray-400 tracking-wider mb-1">
                    {stat.label.toUpperCase()}
                  </div>
                  <div className="font-black text-lg">{stat.value}</div>
                  <div className="text-[10px] text-gray-400">{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Platforms */}
            {[
              { icon: "🔵", name: "Google Business", url: "g.page/johns-lawn",    active: true },
              { icon: "🔴", name: "Yelp",            url: "yelp.com/biz/johns",   active: true },
              { icon: "🔵", name: "Facebook",         url: "Not connected",        active: false },
              { icon: "🟢", name: "Nextdoor",         url: "Not connected",        active: false },
            ].map((platform) => (
              <div key={platform.name} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-base shrink-0">
                    {platform.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-[13px]">{platform.name}</div>
                    <div className="text-[11px] text-gray-400">{platform.url}</div>
                  </div>
                </div>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                  platform.active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                }`}>
                  {platform.active ? "Active" : "Not set"}
                </span>
              </div>
            ))}
          </Card>

          {/* Smart Gate */}
          <SmartGateCard />
        </div>
      </div>
    </>
  );
}

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
      {[
        { key: "afterJob" as const,      label: "After completed job" },
        { key: "afterRenewal" as const,  label: "After monthly renewal" },
        { key: "gateActive" as const,    label: "Smart gate active" },
        { key: "landingWidget" as const, label: "Landing page widget" },
      ].map((item) => (
        <div key={item.key} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
          <span className="text-[13px] font-medium text-gray-700">{item.label}</span>
          <Toggle checked={gates[item.key]} onChange={() => toggleGate(item.key)} />
        </div>
      ))}
    </Card>
  );
}
