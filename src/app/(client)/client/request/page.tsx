"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

const SERVICES = [
  { label: "Weekly Lawn Care", estimate: 6500 },
  { label: "Mow + Edge", estimate: 8000 },
  { label: "Full Yard Cleanup", estimate: 15000 },
  { label: "Hedge Trimming", estimate: 9500 },
  { label: "Other", estimate: 0 },
] as const;

export default function RequestJobPage() {
  const router = useRouter();
  const [service, setService] = useState("");
  const [customService, setCustomService] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const selectedService = SERVICES.find((s) => s.label === service);
  const estimate = selectedService?.estimate || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, company_id")
      .eq("id", user!.id)
      .single();

    if (!profile) { setError("Profile not found"); setLoading(false); return; }

    const description = service === "Other" ? customService : service;
    const { error: insertError } = await supabase
      .from("job_requests")
      .insert({
        company_id: profile.company_id,
        client_id: profile.id,
        service_description: description,
        estimated_amount: estimate,
      });

    setLoading(false);
    if (insertError) { setError(insertError.message); return; }
    setSuccess(true);
    setTimeout(() => { router.push("/client"); router.refresh(); }, 2000);
  };

  if (success) {
    return (
      <div className="max-w-lg text-center py-16">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="font-extrabold text-xl mb-2">Request Sent!</h2>
        <p className="text-sm text-gray-400">Your service provider will review and respond soon.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h2 className="font-extrabold text-xl mb-1">Request a Job</h2>
      <p className="text-sm text-gray-400 mb-5">Pick a service and we'll send it to your provider</p>

      {error && (
        <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-4" padding="lg">
          <h3 className="font-bold text-xs text-gray-400 tracking-widest mb-3">SERVICE TYPE</h3>
          <div className="flex flex-col gap-2">
            {SERVICES.map((s) => (
              <button key={s.label} type="button" onClick={() => setService(s.label)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                  service === s.label
                    ? "border-brand bg-brand/5 text-brand"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}>
                {s.label}
                {s.estimate > 0 && (
                  <span className="float-right text-gray-400 font-normal">
                    ~${(s.estimate / 100).toFixed(0)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </Card>

        {service === "Other" && (
          <Card className="mb-4" padding="lg">
            <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">
              DESCRIBE THE SERVICE
            </label>
            <textarea value={customService} onChange={(e) => setCustomService(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors resize-none h-24"
              placeholder="What do you need done?" required />
          </Card>
        )}

        {estimate > 0 && (
          <Card className="mb-4 text-center" padding="lg">
            <p className="text-xs text-gray-400 mb-1">Estimated cost</p>
            <p className="font-black text-3xl tracking-tight">${(estimate / 100).toFixed(0)}</p>
            <p className="text-[11px] text-gray-400 mt-1">Final price confirmed by provider</p>
          </Card>
        )}

        <button type="submit" disabled={loading || !service || (service === "Other" && !customService)}
          className="w-full bg-brand-dark text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50">
          {loading ? "..." : "Send Request"}
        </button>
      </form>
    </div>
  );
}
