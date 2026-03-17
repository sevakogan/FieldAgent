"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import type { Lead, Client } from "@/types";

type ContactType = "prospect" | "client";

interface AddContactSheetProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onAddProspect: (lead: Lead) => void;
  readonly onAddClient: (client: Client) => void;
}

const INITIAL_PROSPECT = {
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
  service: "",
};

const INITIAL_CLIENT = {
  name: "",
  phone: "",
  email: "",
  address: "",
  serviceType: "",
  mrr: "",
  billingFrequency: "monthly" as const,
};

const BILLING_OPTIONS = ["weekly", "biweekly", "monthly", "quarterly"] as const;

export function AddContactSheet({ open, onClose, onAddProspect, onAddClient }: AddContactSheetProps) {
  const [contactType, setContactType] = useState<ContactType>("prospect");
  const [prospect, setProspect] = useState(INITIAL_PROSPECT);
  const [client, setClient] = useState(INITIAL_CLIENT);
  const [error, setError] = useState("");

  const reset = () => {
    setProspect(INITIAL_PROSPECT);
    setClient(INITIAL_CLIENT);
    setError("");
    setContactType("prospect");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    setError("");

    if (contactType === "prospect") {
      if (!prospect.name.trim()) {
        setError("Name is required");
        return;
      }

      const newLead: Lead = {
        id: Date.now(),
        name: prospect.name.trim(),
        phone: prospect.phone.trim(),
        service: prospect.service.trim() || "New inquiry",
        value: 0,
        status: "new",
        ago: "Just now",
        es: false,
      };

      onAddProspect(newLead);
      handleClose();
      return;
    }

    if (!client.name.trim()) {
      setError("Name is required");
      return;
    }

    const mrrValue = parseFloat(client.mrr);
    if (client.mrr && isNaN(mrrValue)) {
      setError("MRR must be a valid number");
      return;
    }

    const initials = client.name
      .trim()
      .split(" ")
      .map((w) => w[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("");

    const newClient: Client = {
      id: Date.now(),
      ini: initials || "??",
      name: client.name.trim(),
      phone: client.phone.trim(),
      props: 1,
      mrr: mrrValue || 0,
      bal: 0,
      tag: null,
      last: "Today",
    };

    onAddClient(newClient);
    handleClose();
  };

  const updateProspect = (field: string, value: string) => {
    setProspect((prev) => ({ ...prev, [field]: value }));
  };

  const updateClient = (field: string, value: string) => {
    setClient((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <BottomSheet open={open} onClose={handleClose} title="Add Contact">
      <div className="p-5 pt-0 max-h-[70vh] overflow-y-auto">
        {error && (
          <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4">{error}</div>
        )}

        {/* Type Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
          {(["prospect", "client"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setContactType(t)}
              className={`flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold border-none cursor-pointer transition-all capitalize ${
                contactType === t ? "bg-brand-dark text-white shadow-sm" : "bg-transparent text-gray-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Shared fields */}
        <FormField label="NAME" value={contactType === "prospect" ? prospect.name : client.name}
          onChange={(v) => contactType === "prospect" ? updateProspect("name", v) : updateClient("name", v)}
          placeholder="Full name" />

        <FormField label="PHONE" type="tel"
          value={contactType === "prospect" ? prospect.phone : client.phone}
          onChange={(v) => contactType === "prospect" ? updateProspect("phone", v) : updateClient("phone", v)}
          placeholder="(786) 555-0100" />

        <FormField label="EMAIL" type="email"
          value={contactType === "prospect" ? prospect.email : client.email}
          onChange={(v) => contactType === "prospect" ? updateProspect("email", v) : updateClient("email", v)}
          placeholder="them@email.com" />

        <FormField label="ADDRESS"
          value={contactType === "prospect" ? prospect.address : client.address}
          onChange={(v) => contactType === "prospect" ? updateProspect("address", v) : updateClient("address", v)}
          placeholder="123 SW 8th St, Miami" />

        {/* Prospect-specific */}
        {contactType === "prospect" && (
          <>
            <FormField label="SERVICE INTEREST"
              value={prospect.service}
              onChange={(v) => updateProspect("service", v)}
              placeholder="e.g. Weekly lawn care" />

            <div className="mb-5">
              <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">NOTES</label>
              <textarea
                value={prospect.notes}
                onChange={(e) => updateProspect("notes", e.target.value)}
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors resize-none"
                placeholder="Any notes about this prospect..."
              />
            </div>
          </>
        )}

        {/* Client-specific */}
        {contactType === "client" && (
          <>
            <FormField label="SERVICE TYPE"
              value={client.serviceType}
              onChange={(v) => updateClient("serviceType", v)}
              placeholder="e.g. Weekly Lawn Care" />

            <FormField label="MONTHLY RATE (MRR)" type="number"
              value={client.mrr}
              onChange={(v) => updateClient("mrr", v)}
              placeholder="120" prefix="$" />

            <div className="mb-5">
              <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">BILLING FREQUENCY</label>
              <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-200">
                {BILLING_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => updateClient("billingFrequency", opt)}
                    className={`flex-1 py-2 rounded-[10px] text-[11px] font-semibold border-none cursor-pointer transition-all capitalize ${
                      client.billingFrequency === opt ? "bg-brand-dark text-white" : "bg-transparent text-gray-500"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-brand-dark text-white border-none rounded-xl py-3.5 font-bold text-sm cursor-pointer hover:opacity-85 transition-opacity"
        >
          Add {contactType === "prospect" ? "Prospect" : "Client"}
        </button>
      </div>
    </BottomSheet>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  prefix,
}: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder: string;
  readonly type?: string;
  readonly prefix?: string;
}) {
  return (
    <div className="mb-3">
      <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-3 text-[14px] outline-none focus:border-gray-400 transition-colors ${
            prefix ? "pl-8 pr-4" : "px-4"
          }`}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
