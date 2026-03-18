import { createClient } from "@/lib/supabase/client";
import type { Property } from "@/types";

export async function getProperties(companyId: string): Promise<Property[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function getPropertiesByClient(clientId: string): Promise<Property[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("client_id", clientId)
    .order("is_active", { ascending: false })
    .order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function createProperty(
  companyId: string,
  clientId: string,
  fields: {
    address: string;
    nickname?: string;
    services?: string[];
    monthly_rate?: number;
    is_active?: boolean;
  }
): Promise<Property> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("properties")
    .insert({ company_id: companyId, client_id: clientId, ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProperty(
  id: string,
  fields: Partial<{
    address: string;
    nickname: string;
    services: string[];
    monthly_rate: number;
    is_active: boolean;
  }>
): Promise<Property> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("properties")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProperty(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) throw error;
}
