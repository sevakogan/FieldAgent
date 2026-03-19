import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Subscribe to real-time changes on a Supabase table scoped to a company.
 * Calls `onUpdate` whenever any row in the table is inserted, updated, or deleted.
 */
export function useRealtime(
  tables: string | string[],
  companyId: string | null,
  onUpdate: () => void,
) {
  useEffect(() => {
    if (!companyId) return;

    const supabase = createClient();
    const tableList = Array.isArray(tables) ? tables : [tables];

    const channel = supabase.channel(`realtime:${tableList.join(",")}:${companyId}`);

    for (const table of tableList) {
      channel.on(
        "postgres_changes" as Parameters<typeof channel.on>[0],
        { event: "*", schema: "public", table, filter: `company_id=eq.${companyId}` },
        onUpdate,
      );
    }

    channel.subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [companyId, onUpdate, Array.isArray(tables) ? tables.join(",") : tables]); // eslint-disable-line react-hooks/exhaustive-deps
}
