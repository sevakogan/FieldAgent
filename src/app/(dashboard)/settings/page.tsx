"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { InviteSheet } from "@/components/settings/invite-sheet";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const [inviteRole, setInviteRole] = useState<"crew" | "client" | null>(null);
  const [notifications, setNotifications] = useState({
    sms: true,
    whatsapp: true,
    email: true,
    push: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-lg">
      {/* Business Info */}
      <Card className="mb-4" padding="lg">
        <h2 className="font-extrabold text-[15px] mb-5 tracking-tight">Business Info</h2>
        {[
          { label: "Business Name", value: "John's Lawn Care" },
          { label: "Owner Name",    value: "John" },
          { label: "Phone",         value: "(786) 555-0100" },
        ].map((field) => (
          <div key={field.label} className="mb-4 last:mb-0">
            <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">
              {field.label.toUpperCase()}
            </label>
            <input
              className="w-full bg-gray-50 border border-gray-200 rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none focus:border-gray-400 transition-colors"
              defaultValue={field.value}
            />
          </div>
        ))}
      </Card>

      {/* Team & Clients */}
      <Card className="mb-4" padding="lg">
        <h2 className="font-extrabold text-[15px] mb-4">Team & Clients</h2>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setInviteRole("crew")}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 text-sm font-semibold cursor-pointer hover:bg-gray-100 transition-colors text-left px-4"
          >
            👷 Invite Crew Member
          </button>
          <button
            onClick={() => setInviteRole("client")}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 text-sm font-semibold cursor-pointer hover:bg-gray-100 transition-colors text-left px-4"
          >
            👤 Invite Client
          </button>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="mb-4" padding="lg">
        <h2 className="font-extrabold text-[15px] mb-4">Notifications</h2>
        {[
          { key: "sms" as const,      icon: "📱", label: "SMS",      sub: "Job + invoice alerts" },
          { key: "whatsapp" as const, icon: "💬", label: "WhatsApp", sub: "Spanish customers prefer this" },
          { key: "email" as const,    icon: "📧", label: "Email",    sub: "Invoices + receipts" },
          { key: "push" as const,     icon: "🔔", label: "Push",     sub: "Real-time" },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
            <div>
              <div className="font-semibold text-[13px]">{item.icon} {item.label}</div>
              <div className="text-[11px] text-gray-400">{item.sub}</div>
            </div>
            <Toggle
              checked={notifications[item.key]}
              onChange={() => toggleNotification(item.key)}
            />
          </div>
        ))}
      </Card>

      {/* Payment Methods — desktop only */}
      <Card className="hidden md:block mb-4" padding="lg">
        <h2 className="font-extrabold text-[15px] mb-5 tracking-tight">Payment Methods</h2>
        {[
          { label: "Zelle",       value: "(305) 555-0100" },
          { label: "Cash App",    value: "$JohnsLawnMiami" },
          { label: "Venmo",       value: "@JohnsLawn" },
          { label: "Stripe Link", value: "stripe.com/pay/johns" },
        ].map((field) => (
          <div key={field.label} className="mb-4 last:mb-0">
            <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">
              {field.label.toUpperCase()}
            </label>
            <input
              className="w-full bg-gray-50 border border-gray-200 rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none focus:border-gray-400 transition-colors"
              defaultValue={field.value}
            />
          </div>
        ))}
      </Card>

      <button className="w-full bg-brand-dark text-white border-none rounded-[14px] py-3.5 font-bold text-sm cursor-pointer hover:opacity-85 transition-opacity">
        Save Settings
      </button>

      <button
        onClick={async () => {
          const supabase = createClient();
          await supabase.auth.signOut();
          router.push("/login");
          router.refresh();
        }}
        className="w-full mt-3 bg-white text-red-600 border border-red-200 rounded-[14px] py-3.5 font-bold text-sm cursor-pointer hover:bg-red-50 transition-colors"
      >
        Sign Out
      </button>

      <InviteSheet
        open={inviteRole !== null}
        onClose={() => setInviteRole(null)}
        defaultRole={inviteRole ?? "crew"}
      />
    </div>
  );
}
