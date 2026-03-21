'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanyId } from '@/lib/actions/bootstrap'
import type { InvoiceStatus } from '@/types/database'

export type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export type InvoiceLineItem = {
  description: string
  quantity: number
  unit_price: number
}

export type InvoiceRow = {
  id: string
  invoice_number: string
  client_name: string
  client_id: string
  total: number
  status: InvoiceStatus
  due_date: string | null
  created_at: string
}

export type InvoiceDetail = {
  id: string
  company_id: string
  client_id: string
  client_name: string
  client_email: string | null
  job_id: string | null
  invoice_number: string
  subtotal: number
  expenses_total: number
  tax_amount: number
  tip_amount: number
  processing_fee: number
  total: number
  status: InvoiceStatus
  due_date: string | null
  paid_at: string | null
  sent_at: string | null
  items: InvoiceLineItem[]
  created_at: string
  updated_at: string
}

export type InvoiceSummary = {
  totalOutstanding: number
  totalPaid: number
  totalOverdue: number
}

export async function getInvoices(filters?: {
  status?: string
}): Promise<ActionResult<InvoiceRow[]>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    let query = supabase
      .from('invoices')
      .select('id, client_id, invoice_number, total, status, due_date, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    const { data: invoices, error: invoicesError } = await query

    if (invoicesError) {
      return { success: false, error: invoicesError.message }
    }

    if (!invoices || invoices.length === 0) {
      return { success: true, data: [] }
    }

    // Resolve client names
    const clientIds = [...new Set(invoices.map(inv => inv.client_id))]

    const { data: clients } = await supabase
      .from('clients')
      .select('id, user_id')
      .in('id', clientIds)

    const userIds = (clients ?? []).map(c => c.user_id)
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name')
      .in('id', userIds.length > 0 ? userIds : ['__none__'])

    const userNameMap = new Map((users ?? []).map(u => [u.id, u.full_name]))
    const clientNameMap = new Map(
      (clients ?? []).map(c => [c.id, userNameMap.get(c.user_id) ?? 'Unknown'])
    )

    const rows: InvoiceRow[] = invoices.map(inv => ({
      id: inv.id,
      invoice_number: inv.invoice_number,
      client_name: clientNameMap.get(inv.client_id) ?? 'Unknown',
      client_id: inv.client_id,
      total: Number(inv.total) || 0,
      status: inv.status as InvoiceStatus,
      due_date: inv.due_date,
      created_at: inv.created_at,
    }))

    return { success: true, data: rows }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch invoices' }
  }
}

export async function getInvoice(id: string): Promise<ActionResult<InvoiceDetail>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .eq('company_id', companyId)
      .single()

    if (invoiceError || !invoice) {
      return { success: false, error: invoiceError?.message ?? 'Invoice not found' }
    }

    // Client info
    const { data: client } = await supabase
      .from('clients')
      .select('user_id')
      .eq('id', invoice.client_id)
      .single()

    let clientName = 'Unknown'
    let clientEmail: string | null = null
    if (client) {
      const { data: user } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', client.user_id)
        .single()
      clientName = user?.full_name ?? 'Unknown'
      clientEmail = user?.email ?? null
    }

    const items: InvoiceLineItem[] = Array.isArray(invoice.items)
      ? (invoice.items as InvoiceLineItem[])
      : []

    const detail: InvoiceDetail = {
      id: invoice.id,
      company_id: invoice.company_id,
      client_id: invoice.client_id,
      client_name: clientName,
      client_email: clientEmail,
      job_id: invoice.job_id,
      invoice_number: invoice.invoice_number,
      subtotal: Number(invoice.subtotal) || 0,
      expenses_total: Number(invoice.expenses_total) || 0,
      tax_amount: Number(invoice.tax_amount) || 0,
      tip_amount: Number(invoice.tip_amount) || 0,
      processing_fee: Number(invoice.processing_fee) || 0,
      total: Number(invoice.total) || 0,
      status: invoice.status as InvoiceStatus,
      due_date: invoice.due_date,
      paid_at: invoice.paid_at,
      sent_at: invoice.sent_at,
      items,
      created_at: invoice.created_at,
      updated_at: invoice.updated_at,
    }

    return { success: true, data: detail }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch invoice' }
  }
}

export async function getInvoiceSummary(): Promise<ActionResult<InvoiceSummary>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('total, status')
      .eq('company_id', companyId)

    if (error) {
      return { success: false, error: error.message }
    }

    const summary = (invoices ?? []).reduce(
      (acc, inv) => {
        const total = Number(inv.total) || 0
        if (inv.status === 'pending') {
          return { ...acc, totalOutstanding: acc.totalOutstanding + total }
        }
        if (inv.status === 'paid') {
          return { ...acc, totalPaid: acc.totalPaid + total }
        }
        if (inv.status === 'overdue') {
          return { ...acc, totalOverdue: acc.totalOverdue + total, totalOutstanding: acc.totalOutstanding + total }
        }
        return acc
      },
      { totalOutstanding: 0, totalPaid: 0, totalOverdue: 0 } as InvoiceSummary
    )

    return { success: true, data: summary }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch invoice summary' }
  }
}

async function generateInvoiceNumber(supabase: ReturnType<typeof createAdminClient>, companyId: string): Promise<string> {
  const { data } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!data?.invoice_number) {
    return 'INV-0001'
  }

  const match = data.invoice_number.match(/INV-(\d+)/)
  if (!match) {
    return 'INV-0001'
  }

  const nextNum = parseInt(match[1], 10) + 1
  return `INV-${String(nextNum).padStart(4, '0')}`
}

export async function createInvoice(data: {
  client_id: string
  job_id?: string
  items: InvoiceLineItem[]
  tax_amount?: number
  due_date?: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    if (!data.client_id) {
      return { success: false, error: 'Client is required' }
    }
    if (!data.items || data.items.length === 0) {
      return { success: false, error: 'At least one line item is required' }
    }

    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const invoiceNumber = await generateInvoiceNumber(supabase, companyId)

    const subtotal = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    )
    const taxAmount = data.tax_amount ?? 0
    const total = subtotal + taxAmount

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        company_id: companyId,
        client_id: data.client_id,
        job_id: data.job_id || null,
        invoice_number: invoiceNumber,
        subtotal,
        expenses_total: 0,
        tax_amount: taxAmount,
        tip_amount: 0,
        processing_fee: 0,
        total,
        status: 'pending',
        due_date: data.due_date || null,
        items: data.items,
        late_fee: 0,
        retry_count: 0,
      })
      .select('id')
      .single()

    if (error || !invoice) {
      return { success: false, error: `Failed to create invoice: ${error?.message}` }
    }

    return { success: true, data: { id: invoice.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create invoice' }
  }
}

export async function updateInvoiceStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const update: Record<string, unknown> = { status }

    if (status === 'paid') {
      update.paid_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('invoices')
      .update(update)
      .eq('id', id)
      .eq('company_id', companyId)

    if (error) {
      return { success: false, error: `Failed to update invoice status: ${error.message}` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update invoice status' }
  }
}

export async function markInvoiceSent(id: string): Promise<ActionResult> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('invoices')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', companyId)

    if (error) {
      return { success: false, error: `Failed to mark invoice as sent: ${error.message}` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to mark invoice as sent' }
  }
}

export async function deleteInvoice(id: string): Promise<ActionResult> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('company_id', companyId)

    if (error) {
      return { success: false, error: `Failed to delete invoice: ${error.message}` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete invoice' }
  }
}
