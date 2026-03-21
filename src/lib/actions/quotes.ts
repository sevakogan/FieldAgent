'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanyId } from '@/lib/actions/bootstrap'
import type { QuoteStatus } from '@/types/database'

export type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export type QuoteLineItem = {
  description: string
  quantity: number
  unit_price: number
}

export type QuoteRow = {
  id: string
  title: string | null
  client_name: string
  client_id: string
  total: number
  status: QuoteStatus
  valid_until: string | null
  created_at: string
}

export type QuoteDetail = {
  id: string
  company_id: string
  client_id: string
  client_name: string
  address_id: string | null
  address_display: string | null
  service_type_id: string | null
  service_name: string | null
  title: string | null
  description: string | null
  line_items: QuoteLineItem[]
  subtotal: number
  tax_amount: number
  total: number
  valid_until: string | null
  status: QuoteStatus
  sent_at: string | null
  accepted_at: string | null
  created_at: string
  updated_at: string
}

export type ClientOption = {
  id: string
  name: string
}

export type AddressOption = {
  id: string
  display: string
  client_id: string
}

export async function getQuotes(filters?: {
  status?: string
}): Promise<ActionResult<QuoteRow[]>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    let query = supabase
      .from('quotes')
      .select('id, client_id, title, total, status, valid_until, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    const { data: quotes, error: quotesError } = await query

    if (quotesError) {
      return { success: false, error: quotesError.message }
    }

    if (!quotes || quotes.length === 0) {
      return { success: true, data: [] }
    }

    // Resolve client names: client_id → clients.user_id → users.full_name
    const clientIds = [...new Set(quotes.map(q => q.client_id))]

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

    const rows: QuoteRow[] = quotes.map(q => ({
      id: q.id,
      title: q.title,
      client_name: clientNameMap.get(q.client_id) ?? 'Unknown',
      client_id: q.client_id,
      total: Number(q.total) || 0,
      status: q.status as QuoteStatus,
      valid_until: q.valid_until,
      created_at: q.created_at,
    }))

    return { success: true, data: rows }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch quotes' }
  }
}

export async function getQuote(id: string): Promise<ActionResult<QuoteDetail>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .eq('company_id', companyId)
      .single()

    if (quoteError || !quote) {
      return { success: false, error: quoteError?.message ?? 'Quote not found' }
    }

    // Client name
    const { data: client } = await supabase
      .from('clients')
      .select('user_id')
      .eq('id', quote.client_id)
      .single()

    let clientName = 'Unknown'
    if (client) {
      const { data: user } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', client.user_id)
        .single()
      clientName = user?.full_name ?? 'Unknown'
    }

    // Address display
    let addressDisplay: string | null = null
    if (quote.address_id) {
      const { data: address } = await supabase
        .from('addresses')
        .select('street, city, state, zip')
        .eq('id', quote.address_id)
        .single()
      if (address) {
        addressDisplay = `${address.street}, ${address.city}, ${address.state} ${address.zip}`
      }
    }

    // Service name
    let serviceName: string | null = null
    if (quote.service_type_id) {
      const { data: service } = await supabase
        .from('service_types')
        .select('name')
        .eq('id', quote.service_type_id)
        .single()
      serviceName = service?.name ?? null
    }

    const lineItems: QuoteLineItem[] = Array.isArray(quote.line_items)
      ? (quote.line_items as QuoteLineItem[])
      : []

    const detail: QuoteDetail = {
      id: quote.id,
      company_id: quote.company_id,
      client_id: quote.client_id,
      client_name: clientName,
      address_id: quote.address_id,
      address_display: addressDisplay,
      service_type_id: quote.service_type_id,
      service_name: serviceName,
      title: quote.title,
      description: quote.description,
      line_items: lineItems,
      subtotal: Number(quote.subtotal) || 0,
      tax_amount: Number(quote.tax_amount) || 0,
      total: Number(quote.total) || 0,
      valid_until: quote.valid_until,
      status: quote.status as QuoteStatus,
      sent_at: quote.sent_at,
      accepted_at: quote.accepted_at,
      created_at: quote.created_at,
      updated_at: quote.updated_at,
    }

    return { success: true, data: detail }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch quote' }
  }
}

export async function createQuote(data: {
  client_id: string
  address_id?: string
  service_type_id?: string
  title: string
  description?: string
  line_items: QuoteLineItem[]
  tax_amount?: number
  valid_until?: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    if (!data.client_id) {
      return { success: false, error: 'Client is required' }
    }
    if (!data.title.trim()) {
      return { success: false, error: 'Title is required' }
    }
    if (!data.line_items || data.line_items.length === 0) {
      return { success: false, error: 'At least one line item is required' }
    }

    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const subtotal = data.line_items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    )
    const taxAmount = data.tax_amount ?? 0
    const total = subtotal + taxAmount

    const { data: quote, error } = await supabase
      .from('quotes')
      .insert({
        company_id: companyId,
        client_id: data.client_id,
        address_id: data.address_id || null,
        service_type_id: data.service_type_id || null,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        line_items: data.line_items,
        subtotal,
        tax_amount: taxAmount,
        total,
        valid_until: data.valid_until || null,
        status: 'draft',
        services: data.line_items, // backward compat with old schema
      })
      .select('id')
      .single()

    if (error || !quote) {
      return { success: false, error: `Failed to create quote: ${error?.message}` }
    }

    return { success: true, data: { id: quote.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create quote' }
  }
}

export async function updateQuote(
  id: string,
  data: {
    title?: string
    description?: string
    client_id?: string
    address_id?: string | null
    service_type_id?: string | null
    line_items?: QuoteLineItem[]
    tax_amount?: number
    valid_until?: string | null
  }
): Promise<ActionResult> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const update: Record<string, unknown> = {}

    if (data.title !== undefined) update.title = data.title.trim()
    if (data.description !== undefined) update.description = data.description.trim() || null
    if (data.client_id !== undefined) update.client_id = data.client_id
    if (data.address_id !== undefined) update.address_id = data.address_id
    if (data.service_type_id !== undefined) update.service_type_id = data.service_type_id

    if (data.line_items !== undefined) {
      const subtotal = data.line_items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      )
      const taxAmount = data.tax_amount ?? 0
      update.line_items = data.line_items
      update.services = data.line_items // backward compat
      update.subtotal = subtotal
      update.tax_amount = taxAmount
      update.total = subtotal + taxAmount
    } else if (data.tax_amount !== undefined) {
      // Fetch existing subtotal to recalculate total
      const { data: existing } = await supabase
        .from('quotes')
        .select('subtotal')
        .eq('id', id)
        .eq('company_id', companyId)
        .single()

      const existingSubtotal = Number(existing?.subtotal) || 0
      update.tax_amount = data.tax_amount
      update.total = existingSubtotal + data.tax_amount
    }

    if (data.valid_until !== undefined) update.valid_until = data.valid_until

    if (Object.keys(update).length === 0) {
      return { success: true }
    }

    const { error } = await supabase
      .from('quotes')
      .update(update)
      .eq('id', id)
      .eq('company_id', companyId)

    if (error) {
      return { success: false, error: `Failed to update quote: ${error.message}` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update quote' }
  }
}

export async function updateQuoteStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const update: Record<string, unknown> = { status }

    if (status === 'sent') {
      update.sent_at = new Date().toISOString()
    } else if (status === 'accepted') {
      update.accepted_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('quotes')
      .update(update)
      .eq('id', id)
      .eq('company_id', companyId)

    if (error) {
      return { success: false, error: `Failed to update quote status: ${error.message}` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update quote status' }
  }
}

export async function deleteQuote(id: string): Promise<ActionResult> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id)
      .eq('company_id', companyId)

    if (error) {
      return { success: false, error: `Failed to delete quote: ${error.message}` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete quote' }
  }
}

export async function getClientOptions(): Promise<ActionResult<ClientOption[]>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data: clientCompanies, error: ccError } = await supabase
      .from('client_companies')
      .select('client_id')
      .eq('company_id', companyId)

    if (ccError) {
      return { success: false, error: ccError.message }
    }

    if (!clientCompanies || clientCompanies.length === 0) {
      return { success: true, data: [] }
    }

    const clientIds = clientCompanies.map(cc => cc.client_id)

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

    const options: ClientOption[] = (clients ?? []).map(c => ({
      id: c.id,
      name: userNameMap.get(c.user_id) ?? 'Unknown',
    }))

    return { success: true, data: options }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch clients' }
  }
}

export async function getAddressOptions(): Promise<ActionResult<AddressOption[]>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('id, client_id, street, city, state, zip')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .order('street')

    if (error) {
      return { success: false, error: error.message }
    }

    const options: AddressOption[] = (addresses ?? []).map(a => ({
      id: a.id,
      display: `${a.street}, ${a.city}, ${a.state} ${a.zip}`,
      client_id: a.client_id,
    }))

    return { success: true, data: options }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch addresses' }
  }
}
