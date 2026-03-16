"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import type { JobRequest } from "@/types";

interface RequestCardProps {
  readonly request: JobRequest & { readonly profiles: { readonly full_name: string } };
  readonly onUpdate: () => void;
}

export function RequestCard({ request, onUpdate }: RequestCardProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(request.estimated_amount / 100));
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("job_requests")
      .update({
        status: "approved",
        owner_amount: Math.round(parseFloat(amount) * 100),
      })
      .eq("id", request.id);
    setLoading(false);
    setOpen(false);
    onUpdate();
  };

  const handleDecline = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("job_requests")
      .update({ status: "declined" })
      .eq("id", request.id);
    setLoading(false);
    setOpen(false);
    onUpdate();
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>
        <Card className="flex items-center gap-3 cursor-pointer hover:shadow-md transition-all" padding="sm">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-base shrink-0">📋</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[13px]">{request.profiles.full_name}</div>
            <div className="text-[11px] text-gray-400 truncate">{request.service_description}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-bold text-[13px]">{formatCurrency(request.estimated_amount)}</div>
            <div className="text-[10px] text-yellow-600 font-semibold">Pending</div>
          </div>
        </Card>
      </div>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Job Request">
        <div className="p-5 pt-0">
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-1">Client</p>
            <p className="font-bold text-sm">{request.profiles.full_name}</p>
          </div>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-1">Service</p>
            <p className="font-bold text-sm">{request.service_description}</p>
          </div>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-1">Client estimate</p>
            <p className="font-bold text-sm">{formatCurrency(request.estimated_amount)}</p>
          </div>
          <div className="mb-5">
            <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">YOUR PRICE</label>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold">$</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                min="0" step="1" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDecline} disabled={loading}
              className="flex-1 bg-white text-red-600 border border-red-200 rounded-xl py-3 font-bold text-sm cursor-pointer hover:bg-red-50 transition-colors disabled:opacity-50">
              Decline
            </button>
            <button onClick={handleApprove} disabled={loading}
              className="flex-1 bg-brand-dark text-white border-none rounded-xl py-3 font-bold text-sm cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50">
              {loading ? "..." : "Approve"}
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
