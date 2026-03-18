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

const INITIAL_PROSPECT = { name: "", phone: "", service: "", notes: "" };
const INITIAL_CLIENT = { name: "", phone: "", email: "" };

export function AddContactSheet({ open, companyId, onClose, onSuccess }: AddContactSheetProps) {
  const [contactType, setContactType] = useState<ContactType>("prospect");
  const [prospect, setProspect] = useState(INITIAL_PROSPECT);
  const [client, setClient] = useState(INITIAL_CLIENT);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async () => {
    setError("");

    if (contactType === "prospect") {
      if (!prospect.name.trim()) { setError("Name is required"); return; }
      setLoading(true);
      try {
        await createLead(companyId, {
          name: prospect.name.trim(),
          phone: prospect.phone.trim() || undefined,
          service: prospect.service.trim() || undefined,
        });
        onSuccess();
        handleClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add prospect");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!client.name.trim()) { setError("Name is required"); return; }
    setLoading(true);
    try {
      await createClientRecord(companyId, {
        name: client.name.trim(),
        phone: client.phone.trim() || undefined,
        email: client.email.trim() || undefined,
      });
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add client");
    } finally {
      setLoading(false);
    }
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

        {/* Form fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0">
          <FormField
            label="NAME"
            value={contactType === "prospect" ? prospect.name : client.name}
            onChange={(v) =>
              contactType === "prospect"
                ? setProspect((p) => ({ ...p, name: v }))
                : setClient((c) => ({ ...c, name: v }))
            }
            placeholder="Full name"
          />

          <FormField
            label="PHONE"
            type="tel"
            value={contactType === "prospect" ? prospect.phone : client.phone}
            onChange={(v) =>
              contactType === "prospect"
                ? setProspect((p) => ({ ...p, phone: v }))
                : setClient((c) => ({ ...c, phone: v }))
            }
            placeholder="(786) 555-0100"
          />

          {contactType === "client" && (
            <FormField
              label="EMAIL"
              type="email"
              value={client.email}
              onChange={(v) => setClient((c) => ({ ...c, email: v }))}
              placeholder="them@email.com"
            />
          )}

          {contactType === "prospect" && (
            <>
              <FormField
                label="SERVICE INTEREST"
                value={prospect.service}
                onChange={(v) => setProspect((p) => ({ ...p, service: v }))}
                placeholder="e.g. Weekly lawn care"
              />
              <div className="mb-3 sm:col-span-2">
                <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">NOTES</label>
                <textarea
                  value={prospect.notes}
                  onChange={(e) => setProspect((p) => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors resize-none"
                  placeholder="Any notes about this prospect..."
                />
              </div>
            </>
          )}
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
  label,
  value,
  onChange,
  placeholder,
  type = "text",
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
