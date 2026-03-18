import { createClient } from "@/lib/supabase/client";
import type { Call } from "@/types";

export async function getCalls(companyId: string): Promise<Call[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("calls")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

export async function createCall(
  companyId: string,
  fields: {
    name?: string;
    number?: string;
    duration?: string;
    outbound?: boolean;
  }
): Promise<Call> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("calls")
    .insert({ company_id: companyId, outbound: true, ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
}
