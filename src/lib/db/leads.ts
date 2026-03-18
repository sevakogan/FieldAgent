import { createClient } from "@/lib/supabase/client";
import type { Lead, LeadStatus } from "@/types";

export async function getLeads(companyId: string): Promise<Lead[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createLead(
  companyId: string,
  fields: {
    name: string;
    phone?: string;
    service?: string;
    value?: number;
    spanish_speaker?: boolean;
  }
): Promise<Lead> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({ company_id: companyId, status: "new", ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLead(
  id: string,
  fields: Partial<{ name: string; phone: string; service: string; value: number; status: LeadStatus; spanish_speaker: boolean }>
): Promise<Lead> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("leads")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLead(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
}
