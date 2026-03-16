"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { RequestCard } from "./request-card";
import type { JobRequest } from "@/types";

type RequestWithProfile = JobRequest & { readonly profiles: { readonly full_name: string } };

export function PendingRequests() {
  const [requests, setRequests] = useState<readonly RequestWithProfile[]>([]);

  const fetchRequests = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("job_requests")
      .select("*, profiles(full_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (data) setRequests(data as unknown as RequestWithProfile[]);
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  if (requests.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="font-bold text-xs text-gray-400 tracking-widest mb-3">
        JOB REQUESTS ({requests.length})
      </h3>
      <div className="flex flex-col gap-2">
        {requests.map((req) => (
          <RequestCard key={req.id} request={req} onUpdate={fetchRequests} />
        ))}
      </div>
    </div>
  );
}
