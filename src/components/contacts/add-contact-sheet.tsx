"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { createClientRecord } from "@/lib/db/clients";
import { createLead } from "@/lib/db/leads";

type ContactType = "prospect" | "client";

interface AddContactSheetProps {
  readonly open: boolean;
  readonly companyId: string;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

const SERVICE_PILLS = [
  "Lawn Care",
  "Pool Service",
  "Pressure Washing",
  "Cleaning",
  "Pest Control",
  "HVAC",
  "Window Cleaning",
  "Handyman",
  "Irrigation",
  "Landscaping",
];

const INITIAL_FORM = { name: "", phone: "", job: "", address: "", services: [] as string[], notes: "" };

export function AddContactSheet({ open, companyId, onClose, onSuccess }: AddContactSheetProps) {
  const [contactType, setContactType] = useState<ContactType>("prospect");
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof INITIAL_FORM) => (v: string) =>
    setForm((f) => ({ ...f, [field]: v }));

  const toggleService = (s: string) =>
    setForm((f) => ({
      ...f,
      services: f.services.includes(s)
        ? f.services.filter((x) => x !== s)
        : [...f.services, s],
    }));

  const reset = () => { setForm(INITIAL_FORM); setError(""); setContactType("prospect"); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    setError("");
    if (!form.name.trim()) { setError("Name is required"); return; }
    setLoading(true);
    try {
      const serviceStr = form.services.join(", ") || form.job.trim() || undefined;
      if (contactType === "prospect") {
        await createLead(companyId, {
          name: form.name.trim(),
          phone: form.phone.trim() || undefined,
          service: serviceStr,
        });
      } else {
        await createClientRecord(companyId, {
          name: form.name.trim(),
          phone: form.phone.trim() || undefined,
          email: undefined,
        });
      }
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add contact");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet open={open} onClose={handleClose} title="Add Contact">
      <div className="p-5 pt-0 max-h-[80vh] overflow-y-auto">
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

        {/* Name + Phone */}
        <div className="grid grid-cols-2 gap-x-3">
          <FormField label="NAME"  value={form.name}  onChange={set("name")}  placeholder="Full name" />
          <FormField label="PHONE" value={form.phone} onChange={set("phone")} placeholder="(786) 555-0100" type="tel" />
        </div>

        {/* Job + Address */}
        <div className="grid grid-cols-2 gap-x-3">
          <FormField label="JOB"     value={form.job}     onChange={set("job")}     placeholder="e.g. Property manager" />
          <FormField label="ADDRESS" value={form.address} onChange={set("address")} placeholder="123 Main St" />
        </div>

        {/* Service multi-select pills */}
        <div className="mb-3">
          <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-2">SERVICE</label>
          <div className="flex flex-wrap gap-2">
            {SERVICE_PILLS.map((s) => {
              const active = form.services.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleService(s)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all cursor-pointer ${
                    active
                      ? "bg-brand-dark text-white border-brand-dark"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">NOTES</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors resize-none"
            placeholder="Any notes about this contact..."
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-brand-dark text-white border-none rounded-xl py-3.5 font-bold text-sm cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50"
        >
          {loading ? "Saving..." : `Add ${contactType === "prospect" ? "Prospect" : "Client"}`}
        </button>
      </div>
    </BottomSheet>
  );
}

function FormField({
  label, value, onChange, placeholder, type = "text",
}: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder: string;
  readonly type?: string;
}) {
  return (
    <div className="mb-3">
      <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
        placeholder={placeholder}
      />
    </div>
  );
}
