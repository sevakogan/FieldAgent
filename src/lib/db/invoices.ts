import { createClient } from "@/lib/supabase/client";
import type { Invoice, InvoiceItem, InvoiceStatus } from "@/types";

export async function getInvoices(companyId: string): Promise<Invoice[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("company_id", companyId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getInvoicesByClient(clientId: string): Promise<Invoice[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("client_id", clientId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getInvoicesByProperty(propertyId: string): Promise<Invoice[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("property_id", propertyId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createInvoice(
  companyId: string,
  fields: {
    client_id: string;
    property_id?: string | null;
    job_id?: string | null;
    date: string;
    due_date: string;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
  }
): Promise<Invoice> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("invoices")
    .insert({ company_id: companyId, status: "unpaid", ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus,
  payment_method?: string
): Promise<Invoice> {
  const supabase = createClient();
  const updates: Record<string, unknown> = { status };
  if (status === "paid") {
    updates.paid_date = new Date().toISOString().split("T")[0];
    if (payment_method) updates.payment_method = payment_method;
  }
  const { data, error } = await supabase
    .from("invoices")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteInvoice(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) throw error;
}
