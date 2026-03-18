import { createClient } from "@/lib/supabase/client";
import type { Job, JobStatus } from "@/types";

export async function getJobs(companyId: string): Promise<Job[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*, clients(id, name), properties(id, address, nickname)")
    .eq("company_id", companyId)
    .order("date")
    .order("time");
  if (error) throw error;
  return data ?? [];
}

export async function getJobsByClient(clientId: string): Promise<Job[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*, properties(id, address, nickname)")
    .eq("client_id", clientId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getJobsByProperty(propertyId: string): Promise<Job[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("property_id", propertyId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createJob(
  companyId: string,
  fields: {
    client_id: string;
    property_id?: string | null;
    service: string;
    worker?: string;
    date: string;
    time?: string;
    total?: number;
    notes?: string;
  }
): Promise<Job> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("jobs")
    .insert({ company_id: companyId, status: "upcoming", ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateJob(
  id: string,
  fields: Partial<{
    status: JobStatus;
    date: string;
    time: string;
    service: string;
    worker: string;
    total: number;
    photos: number;
    notes: string;
    property_id: string | null;
  }>
): Promise<Job> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("jobs")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteJob(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) throw error;
}
