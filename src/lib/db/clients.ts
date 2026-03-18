import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import type { Client } from "@/types";

export async function getClients(companyId: string): Promise<Client[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("company_id", companyId)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getClientById(id: string): Promise<Client | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createClientRecord(
  companyId: string,
  fields: { name: string; phone?: string; email?: string; tag?: string | null }
): Promise<Client> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({ company_id: companyId, ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateClientRecord(
  id: string,
  fields: Partial<{ name: string; phone: string; email: string; tag: string | null }>
): Promise<Client> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteClientRecord(id: string): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw error;
}
