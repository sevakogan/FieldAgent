"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { InviteSheet } from "@/components/settings/invite-sheet";
import { ServiceRow } from "@/components/settings/service-row";
import { BusinessTypeSelector } from "@/components/settings/business-type-selector";
import { createClient } from "@/lib/supabase/client";
import type { BusinessType, CompanyService } from "@/types";

export default function SettingsPage() {
  const router = useRouter();
  const [inviteRole, setInviteRole] = useState<"crew" | "client" | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [businessType, setBusinessType] = useState<string>("lawn_care");
  const [services, setServices] = useState<CompanyService[]>([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [addingService, setAddingService] = useState(false);
  const [notifications, setNotifications] = useState({
    sms: true,
    whatsapp: true,
    email: true,
    push: true,
  });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, company_id")
        .eq("id", user.id)
        .single();

      if (profile) {
        setOwnerName(profile.full_name || "");
        setPhone(profile.phone || "");
        setCompanyId(profile.company_id);

        if (profile.company_id) {
          const { data: company } = await supabase
            .from("companies")
            .select("name, business_type")
            .eq("id", profile.company_id)
            .single();
          if (company) {
            setBusinessName(company.name);
            setBusinessType(company.business_type || "lawn_care");
          }

          const { data: companyServices } = await supabase
            .from("company_services")
            .select("*")
            .eq("company_id", profile.company_id)
            .order("sort_order");
          if (companyServices) setServices(companyServices as CompanyService[]);
        }
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    await supabase
      .from("profiles")
      .update({ full_name: ownerName, phone })
      .eq("id", user.id);

    if (companyId) {
      await supabase
        .from("companies")
        .update({ name: businessName, phone })
        .eq("id", companyId);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleService = async (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;
    const supabase = createClient();
    await supabase
      .from("company_services")
      .update({ is_active: !service.is_active })
      .eq("id", serviceId);
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, is_active: !s.is_active } : s))
    );
  };

  const updateServicePrice = async (serviceId: string, newPrice: number) => {
    const supabase = createClient();
    await supabase
      .from("company_services")
      .update({ default_price: newPrice })
      .eq("id", serviceId);
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, default_price: newPrice } : s))
    );
  };

  const updateServiceName = async (serviceId: string, newName: string) => {
    const supabase = createClient();
    await supabase
      .from("company_services")
      .update({ name: newName })
      .eq("id", serviceId);
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, name: newName } : s))
    );
  };

  const deleteService = async (serviceId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("company_services")
      .delete()
      .eq("id", serviceId);
    if (!error) {
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    }
  };

  const handleChangeBusinessType = async (newType: BusinessType) => {
    if (!companyId) return;

    const response = await fetch("/api/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: businessName,
        fullName: ownerName,
        phone,
        businessType: newType,
      }),
    });

    if (!response.ok) return;

    setBusinessType(newType);

    // Reload services from DB after re-seeding
    const supabase = createClient();
    const { data: companyServices } = await supabase
      .from("company_services")
      .select("*")
      .eq("company_id", companyId)
      .order("sort_order");
    if (companyServices) {
      setServices(companyServices as CompanyService[]);
    }
  };

  const handleAddService = async () => {
    if (!companyId || !newServiceName.trim() || !newServicePrice.trim()) return;
    const priceInCents = Math.round(parseFloat(newServicePrice) * 100);
    if (isNaN(priceInCents) || priceInCents <= 0) return;

    const supabase = createClient();
    const { data } = await supabase
      .from("company_services")
      .insert({
        company_id: companyId,
        name: newServiceName.trim(),
        default_price: priceInCents,
        category: "",
      })
      .select("*")
      .single();

    if (data) {
      setServices((prev) => [...prev, data as CompanyService]);
      setNewServiceName("");
      setNewServicePrice("");
      setAddingService(false);
    }
  };

  return (
    <div className="max-w-lg">
      {/* Business Info */}
      <Card className="mb-4" padding="lg">
        <h2 className="font-extrabold text-[15px] mb-5 tracking-tight">Business Info</h2>
        <div className="mb-4">
          <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">BUSINESS NAME</label>
          <input
            className="w-full bg-gray-50 border border-gray-200 rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none focus:border-gray-400 transition-colors"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">OWNER NAME</label>
          <input
            className="w-full bg-gray-50 border border-gray-200 rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none focus:border-gray-400 transition-colors"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">PHONE</label>
          <input
            className="w-full bg-gray-50 border border-gray-200 rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none focus:border-gray-400 transition-colors"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </Card>

      {/* Business Type */}
      <Card className="mb-4" padding="lg">
        <h2 className="font-extrabold text-[15px] mb-4 tracking-tight">Business Type</h2>
        <BusinessTypeSelector
          currentType={businessType}
          onConfirm={handleChangeBusinessType}
        />
      </Card>

      {/* Services */}
      <Card className="mb-4" padding="lg">
        <h2 className="font-extrabold text-[15px] mb-4 tracking-tight">Services</h2>
        {services.map((service) => (
          <ServiceRow
            key={service.id}
            name={service.name}
            category={service.category}
            price={service.default_price}
            isActive={service.is_active}
            onToggle={() => toggleService(service.id)}
            onUpdatePrice={(newPrice) => updateServicePrice(service.id, newPrice)}
            onUpdateName={(newName) => updateServiceName(service.id, newName)}
            onDelete={() => deleteService(service.id)}
          />
        ))}
        {addingService ? (
          <div className="flex items-center gap-2 mt-3">
            <input
              className="flex-1 bg-gray-50 border border-gray-200 rounded-[10px] px-3 py-2 text-[13px] outline-none focus:border-gray-400 transition-colors"
              placeholder="Service name"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
            />
            <input
              className="w-20 bg-gray-50 border border-gray-200 rounded-[10px] px-3 py-2 text-[13px] outline-none focus:border-gray-400 transition-colors"
              placeholder="Price $"
              value={newServicePrice}
              onChange={(e) => setNewServicePrice(e.target.value)}
              type="number"
              min="0"
              step="1"
            />
            <button
              onClick={handleAddService}
              className="bg-brand-dark text-white rounded-[10px] px-3.5 py-2 text-[12px] font-semibold cursor-pointer hover:opacity-85 transition-opacity"
            >
              Save
            </button>
            <button
              onClick={() => { setAddingService(false); setNewServiceName(""); setNewServicePrice(""); }}
              className="text-gray-400 text-[12px] font-semibold cursor-pointer hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingService(true)}
            className="w-full mt-3 bg-gray-50 border border-gray-200 rounded-xl py-2.5 text-[13px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
          >
            + Add Service
          </button>
        )}
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

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-brand-dark text-white border-none rounded-[14px] py-3.5 font-bold text-sm cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50"
      >
        {saved ? "Saved!" : saving ? "Saving..." : "Save Settings"}
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
