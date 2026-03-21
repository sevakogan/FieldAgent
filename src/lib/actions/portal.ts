'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

// ─── Client resolution ─────────────────────────────────────────────
// Portal pages call this to identify the current client.
// For now: returns the first client record. In production this would
// be gated behind auth.

export type PortalClient = {
  clientId: string
  userId: string
  fullName: string
  email: string
  phone: string | null
  avatarUrl: string | null
}

export async function getPortalClient(): Promise<ActionResult<PortalClient>> {
  try {
    const supabase = createAdminClient()

    const { data: client, error: clientErr } = await supabase
      .from('clients')
      .select('id, user_id, created_at')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (clientErr || !client) {
      return { success: false, error: 'No client account found' }
    }

    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id, full_name, email, phone, avatar_url')
      .eq('id', client.user_id)
      .single()

    if (userErr || !user) {
      return { success: false, error: 'User record not found' }
    }

    return {
      success: true,
      data: {
        clientId: client.id,
        userId: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone ?? null,
        avatarUrl: user.avatar_url ?? null,
      },
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to resolve portal client' }
  }
}

// ─── Dashboard stats ────────────────────────────────────────────────

export type PortalDashboardData = {
  client: PortalClient
  upcomingJobsCount: number
  outstandingBalance: number
  unreadMessages: number
  recentJobs: Array<{
    id: string
    serviceName: string
    address: string
    scheduledDate: string
    scheduledTime: string | null
    status: string
  }>
  recentInvoices: Array<{
    id: string
    invoiceNumber: string
    total: number
    status: string
    createdAt: string
  }>
}

export async function getPortalDashboard(): Promise<ActionResult<PortalDashboardData>> {
  try {
    const clientResult = await getPortalClient()
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: clientResult.error ?? 'No client account found' }
    }
    const client = clientResult.data
    const supabase = createAdminClient()

    // Get client_companies to find which companies this client belongs to
    const { data: clientCompanies } = await supabase
      .from('client_companies')
      .select('company_id')
      .eq('client_id', client.clientId)

    const companyIds = (clientCompanies ?? []).map(cc => cc.company_id)
    if (companyIds.length === 0) {
      return {
        success: true,
        data: {
          client,
          upcomingJobsCount: 0,
          outstandingBalance: 0,
          unreadMessages: 0,
          recentJobs: [],
          recentInvoices: [],
        },
      }
    }

    // Get addresses for this client
    const { data: addresses } = await supabase
      .from('addresses')
      .select('id, street, city')
      .eq('client_id', client.clientId)
      .in('company_id', companyIds)

    const addressIds = (addresses ?? []).map(a => a.id)
    const addressMap = new Map((addresses ?? []).map(a => [a.id, `${a.street}, ${a.city}`]))

    const today = new Date().toISOString().slice(0, 10)

    // Upcoming jobs
    const { data: upcomingJobs } = addressIds.length > 0
      ? await supabase
          .from('jobs')
          .select('id, address_id, service_type_id, scheduled_date, scheduled_time, status')
          .in('address_id', addressIds)
          .gte('scheduled_date', today)
          .not('status', 'in', '("completed","cancelled","charged")')
          .order('scheduled_date', { ascending: true })
          .limit(5)
      : { data: [] }

    // Service names for jobs
    const serviceIds = [...new Set((upcomingJobs ?? []).map(j => j.service_type_id))]
    const { data: services } = serviceIds.length > 0
      ? await supabase.from('service_types').select('id, name').in('id', serviceIds)
      : { data: [] }
    const serviceMap = new Map((services ?? []).map(s => [s.id, s.name]))

    // Outstanding invoices
    const { data: outstandingInvoices } = await supabase
      .from('invoices')
      .select('id, total, status')
      .eq('client_id', client.clientId)
      .in('company_id', companyIds)
      .in('status', ['pending', 'overdue'])

    const outstandingBalance = (outstandingInvoices ?? []).reduce(
      (sum, inv) => sum + (Number(inv.total) || 0), 0
    )

    // Unread messages
    const { data: unreadMsgs } = await supabase
      .from('messages')
      .select('id')
      .eq('client_id', client.clientId)
      .in('company_id', companyIds)
      .is('read_at', null)
      .neq('sender_role', 'client')

    // Recent invoices
    const { data: recentInvs } = await supabase
      .from('invoices')
      .select('id, invoice_number, total, status, created_at')
      .eq('client_id', client.clientId)
      .in('company_id', companyIds)
      .order('created_at', { ascending: false })
      .limit(5)

    const recentJobs = (upcomingJobs ?? []).map(j => ({
      id: j.id,
      serviceName: serviceMap.get(j.service_type_id) ?? 'Service',
      address: addressMap.get(j.address_id) ?? 'Unknown',
      scheduledDate: j.scheduled_date,
      scheduledTime: j.scheduled_time,
      status: j.status,
    }))

    const recentInvoices = (recentInvs ?? []).map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      total: Number(inv.total) || 0,
      status: inv.status,
      createdAt: inv.created_at,
    }))

    return {
      success: true,
      data: {
        client,
        upcomingJobsCount: (upcomingJobs ?? []).length,
        outstandingBalance,
        unreadMessages: (unreadMsgs ?? []).length,
        recentJobs,
        recentInvoices,
      },
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load dashboard' }
  }
}

// ─── Calendar jobs ──────────────────────────────────────────────────

export type CalendarJob = {
  id: string
  serviceName: string
  address: string
  scheduledDate: string
  scheduledTime: string | null
  status: string
}

export async function getPortalCalendarJobs(year: number, month: number): Promise<ActionResult<CalendarJob[]>> {
  try {
    const clientResult = await getPortalClient()
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: clientResult.error }
    }
    const supabase = createAdminClient()

    const { data: addresses } = await supabase
      .from('addresses')
      .select('id, street, city')
      .eq('client_id', clientResult.data.clientId)

    const addressIds = (addresses ?? []).map(a => a.id)
    if (addressIds.length === 0) return { success: true, data: [] }

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`

    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, address_id, service_type_id, scheduled_date, scheduled_time, status')
      .in('address_id', addressIds)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .order('scheduled_date')

    const serviceIds = [...new Set((jobs ?? []).map(j => j.service_type_id))]
    const { data: services } = serviceIds.length > 0
      ? await supabase.from('service_types').select('id, name').in('id', serviceIds)
      : { data: [] }
    const serviceMap = new Map((services ?? []).map(s => [s.id, s.name]))
    const addressMap = new Map((addresses ?? []).map(a => [a.id, `${a.street}, ${a.city}`]))

    return {
      success: true,
      data: (jobs ?? []).map(j => ({
        id: j.id,
        serviceName: serviceMap.get(j.service_type_id) ?? 'Service',
        address: addressMap.get(j.address_id) ?? 'Unknown',
        scheduledDate: j.scheduled_date,
        scheduledTime: j.scheduled_time,
        status: j.status,
      })),
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load calendar' }
  }
}

// ─── Job detail ─────────────────────────────────────────────────────

export type PortalJobDetail = {
  id: string
  serviceName: string
  address: string
  scheduledDate: string
  scheduledTime: string | null
  status: string
  price: number
  tipAmount: number
  checklistResults: Array<{ item: string; done: boolean }> | null
  notes: string | null
  companyName: string
  beforePhotos: string[]
  afterPhotos: string[]
}

export async function getPortalJob(jobId: string): Promise<ActionResult<PortalJobDetail>> {
  try {
    const clientResult = await getPortalClient()
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: clientResult.error }
    }
    const supabase = createAdminClient()

    const { data: job, error: jobErr } = await supabase
      .from('jobs')
      .select('id, company_id, address_id, service_type_id, status, scheduled_date, scheduled_time, price, tip_amount, checklist_results, notes')
      .eq('id', jobId)
      .single()

    if (jobErr || !job) {
      return { success: false, error: 'Job not found' }
    }

    // Verify this job belongs to one of the client's addresses
    const { data: address } = await supabase
      .from('addresses')
      .select('id, street, city')
      .eq('id', job.address_id)
      .eq('client_id', clientResult.data.clientId)
      .single()

    if (!address) {
      return { success: false, error: 'Job not found' }
    }

    const { data: service } = await supabase
      .from('service_types')
      .select('name')
      .eq('id', job.service_type_id)
      .single()

    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', job.company_id)
      .single()

    // Fetch job media
    const { data: media } = await supabase
      .from('job_media')
      .select('url, timing')
      .eq('job_id', jobId)

    const beforePhotos = (media ?? []).filter(m => m.timing === 'before').map(m => m.url)
    const afterPhotos = (media ?? []).filter(m => m.timing === 'after').map(m => m.url)

    const checklistResults = Array.isArray(job.checklist_results)
      ? (job.checklist_results as Array<{ item: string; done: boolean }>)
      : null

    return {
      success: true,
      data: {
        id: job.id,
        serviceName: service?.name ?? 'Service',
        address: `${address.street}, ${address.city}`,
        scheduledDate: job.scheduled_date,
        scheduledTime: job.scheduled_time,
        status: job.status,
        price: Number(job.price) || 0,
        tipAmount: Number(job.tip_amount) || 0,
        checklistResults,
        notes: job.notes ?? null,
        companyName: company?.name ?? 'Provider',
        beforePhotos,
        afterPhotos,
      },
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load job' }
  }
}

export async function approvePortalJob(jobId: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('jobs')
      .update({ status: 'completed' })
      .eq('id', jobId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to approve job' }
  }
}

export async function requestJobRevision(jobId: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('jobs')
      .update({ status: 'revision_needed' })
      .eq('id', jobId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to request revision' }
  }
}

export async function updatePortalTip(jobId: string, tipAmount: number): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('jobs')
      .update({ tip_amount: tipAmount })
      .eq('id', jobId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update tip' }
  }
}

// ─── Service request ────────────────────────────────────────────────

export type RequestFormData = {
  addresses: Array<{ id: string; display: string }>
  serviceTypes: Array<{ id: string; name: string; defaultPrice: number; description: string | null }>
}

export async function getRequestFormData(): Promise<ActionResult<RequestFormData>> {
  try {
    const clientResult = await getPortalClient()
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: clientResult.error }
    }
    const supabase = createAdminClient()

    const { data: addresses } = await supabase
      .from('addresses')
      .select('id, street, city, state, zip, company_id')
      .eq('client_id', clientResult.data.clientId)
      .eq('status', 'active')

    const companyIds = [...new Set((addresses ?? []).map(a => a.company_id))]

    const { data: services } = companyIds.length > 0
      ? await supabase
          .from('service_types')
          .select('id, name, default_price, description')
          .in('company_id', companyIds)
          .eq('status', 'active')
          .order('sort_order')
      : { data: [] }

    return {
      success: true,
      data: {
        addresses: (addresses ?? []).map(a => ({
          id: a.id,
          display: `${a.street}, ${a.city}, ${a.state} ${a.zip}`,
        })),
        serviceTypes: (services ?? []).map(s => ({
          id: s.id,
          name: s.name,
          defaultPrice: Number(s.default_price) || 0,
          description: s.description,
        })),
      },
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load form data' }
  }
}

export async function submitServiceRequest(data: {
  addressId: string
  serviceTypeId: string
  scheduledDate: string
  scheduledTime: string
  notes?: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createAdminClient()

    // Get the company_id from the address
    const { data: address } = await supabase
      .from('addresses')
      .select('company_id')
      .eq('id', data.addressId)
      .single()

    if (!address) return { success: false, error: 'Address not found' }

    // Get default price
    const { data: service } = await supabase
      .from('service_types')
      .select('default_price')
      .eq('id', data.serviceTypeId)
      .single()

    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        company_id: address.company_id,
        address_id: data.addressId,
        service_type_id: data.serviceTypeId,
        scheduled_date: data.scheduledDate,
        scheduled_time: data.scheduledTime,
        price: Number(service?.default_price) || 0,
        status: 'requested',
        source: 'client_request',
        notes: data.notes || null,
        expenses_total: 0,
        tax_amount: 0,
        tip_amount: 0,
        photo_required: false,
        auto_approve: false,
        late_cancel_fee: 0,
        deposit_paid: false,
      })
      .select('id')
      .single()

    if (error || !job) return { success: false, error: error?.message ?? 'Failed to create request' }
    return { success: true, data: { id: job.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to submit request' }
  }
}

// ─── Quotes ─────────────────────────────────────────────────────────

export type PortalQuoteRow = {
  id: string
  title: string | null
  companyName: string
  total: number
  status: string
  validUntil: string | null
  createdAt: string
}

export type PortalQuoteDetail = {
  id: string
  title: string | null
  description: string | null
  companyName: string
  addressDisplay: string | null
  serviceName: string | null
  lineItems: Array<{ description: string; quantity: number; unit_price: number }>
  subtotal: number
  taxAmount: number
  total: number
  validUntil: string | null
  status: string
  createdAt: string
}

export async function getPortalQuotes(statusFilter?: string): Promise<ActionResult<PortalQuoteRow[]>> {
  try {
    const clientResult = await getPortalClient()
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: clientResult.error }
    }
    const supabase = createAdminClient()

    let query = supabase
      .from('quotes')
      .select('id, company_id, title, total, status, valid_until, created_at')
      .eq('client_id', clientResult.data.clientId)
      .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data: quotes, error } = await query
    if (error) return { success: false, error: error.message }

    const companyIds = [...new Set((quotes ?? []).map(q => q.company_id))]
    const { data: companies } = companyIds.length > 0
      ? await supabase.from('companies').select('id, name').in('id', companyIds)
      : { data: [] }
    const companyMap = new Map((companies ?? []).map(c => [c.id, c.name]))

    return {
      success: true,
      data: (quotes ?? []).map(q => ({
        id: q.id,
        title: q.title,
        companyName: companyMap.get(q.company_id) ?? 'Provider',
        total: Number(q.total) || 0,
        status: q.status,
        validUntil: q.valid_until,
        createdAt: q.created_at,
      })),
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load quotes' }
  }
}

export async function getPortalQuote(quoteId: string): Promise<ActionResult<PortalQuoteDetail>> {
  try {
    const clientResult = await getPortalClient()
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: clientResult.error }
    }
    const supabase = createAdminClient()

    const { data: quote, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .eq('client_id', clientResult.data.clientId)
      .single()

    if (error || !quote) return { success: false, error: 'Quote not found' }

    const { data: company } = await supabase.from('companies').select('name').eq('id', quote.company_id).single()

    let addressDisplay: string | null = null
    if (quote.address_id) {
      const { data: addr } = await supabase.from('addresses').select('street, city, state, zip').eq('id', quote.address_id).single()
      if (addr) addressDisplay = `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`
    }

    let serviceName: string | null = null
    if (quote.service_type_id) {
      const { data: svc } = await supabase.from('service_types').select('name').eq('id', quote.service_type_id).single()
      serviceName = svc?.name ?? null
    }

    const lineItems = Array.isArray(quote.line_items)
      ? (quote.line_items as Array<{ description: string; quantity: number; unit_price: number }>)
      : []

    return {
      success: true,
      data: {
        id: quote.id,
        title: quote.title,
        description: quote.description,
        companyName: company?.name ?? 'Provider',
        addressDisplay,
        serviceName,
        lineItems,
        subtotal: Number(quote.subtotal) || 0,
        taxAmount: Number(quote.tax_amount) || 0,
        total: Number(quote.total) || 0,
        validUntil: quote.valid_until,
        status: quote.status,
        createdAt: quote.created_at,
      },
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load quote' }
  }
}

export async function acceptPortalQuote(quoteId: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('quotes')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', quoteId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to accept quote' }
  }
}

export async function declinePortalQuote(quoteId: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('quotes')
      .update({ status: 'declined' })
      .eq('id', quoteId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to decline quote' }
  }
}

// ─── Invoices ───────────────────────────────────────────────────────

export type PortalInvoiceRow = {
  id: string
  invoiceNumber: string
  companyName: string
  total: number
  status: string
  dueDate: string | null
  createdAt: string
}

export type PortalInvoiceDetail = {
  id: string
  invoiceNumber: string
  companyName: string
  total: number
  subtotal: number
  taxAmount: number
  status: string
  dueDate: string | null
  paidAt: string | null
  items: Array<{ description: string; quantity: number; unit_price: number }>
  createdAt: string
}

export async function getPortalInvoices(statusFilter?: string): Promise<ActionResult<PortalInvoiceRow[]>> {
  try {
    const clientResult = await getPortalClient()
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: clientResult.error }
    }
    const supabase = createAdminClient()

    let query = supabase
      .from('invoices')
      .select('id, company_id, invoice_number, total, status, due_date, created_at')
      .eq('client_id', clientResult.data.clientId)
      .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data: invoices, error } = await query
    if (error) return { success: false, error: error.message }

    const companyIds = [...new Set((invoices ?? []).map(i => i.company_id))]
    const { data: companies } = companyIds.length > 0
      ? await supabase.from('companies').select('id, name').in('id', companyIds)
      : { data: [] }
    const companyMap = new Map((companies ?? []).map(c => [c.id, c.name]))

    return {
      success: true,
      data: (invoices ?? []).map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoice_number,
        companyName: companyMap.get(inv.company_id) ?? 'Provider',
        total: Number(inv.total) || 0,
        status: inv.status,
        dueDate: inv.due_date,
        createdAt: inv.created_at,
      })),
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load invoices' }
  }
}

export async function getPortalInvoice(invoiceId: string): Promise<ActionResult<PortalInvoiceDetail>> {
  try {
    const clientResult = await getPortalClient()
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: clientResult.error }
    }
    const supabase = createAdminClient()

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('client_id', clientResult.data.clientId)
      .single()

    if (error || !invoice) return { success: false, error: 'Invoice not found' }

    const { data: company } = await supabase.from('companies').select('name').eq('id', invoice.company_id).single()

    const items = Array.isArray(invoice.items)
      ? (invoice.items as Array<{ description: string; quantity: number; unit_price: number }>)
      : []

    return {
      success: true,
      data: {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        companyName: company?.name ?? 'Provider',
        total: Number(invoice.total) || 0,
        subtotal: Number(invoice.subtotal) || 0,
        taxAmount: Number(invoice.tax_amount) || 0,
        status: invoice.status,
        dueDate: invoice.due_date,
        paidAt: invoice.paid_at,
        items,
        createdAt: invoice.created_at,
      },
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load invoice' }
  }
}

export async function payPortalInvoice(invoiceId: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', invoiceId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to pay invoice' }
  }
}

// ─── Receipts (paid invoices) ───────────────────────────────────────

export async function getPortalReceipts(): Promise<ActionResult<PortalInvoiceRow[]>> {
  return getPortalInvoices('paid')
}

// ─── Payments (client_companies auto_pay) ───────────────────────────

export type PortalPaymentInfo = {
  autoPay: boolean
  paymentSchedule: string
  clientCompanyId: string
}

export async function getPortalPaymentInfo(): Promise<ActionResult<PortalPaymentInfo>> {
  try {
    const clientResult = await getPortalClient()
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: clientResult.error }
    }
    const supabase = createAdminClient()

    const { data: cc, error } = await supabase
      .from('client_companies')
      .select('id, auto_pay, payment_schedule')
      .eq('client_id', clientResult.data.clientId)
      .limit(1)
      .single()

    if (error || !cc) return { success: false, error: 'No payment info found' }

    return {
      success: true,
      data: {
        autoPay: cc.auto_pay ?? false,
        paymentSchedule: cc.payment_schedule ?? 'per_job',
        clientCompanyId: cc.id,
      },
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load payment info' }
  }
}

export async function togglePortalAutoPay(clientCompanyId: string, autoPay: boolean): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('client_companies')
      .update({ auto_pay: autoPay })
      .eq('id', clientCompanyId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update auto-pay' }
  }
}

// ─── Reviews ────────────────────────────────────────────────────────

export type PortalReview = {
  id: string
  jobId: string
  serviceName: string
  companyName: string
  rating: number
  review: string | null
  response: string | null
  createdAt: string
}

export type PortalPendingReview = {
  jobId: string
  serviceName: string
  companyName: string
  scheduledDate: string
  address: string
}

export async function getPortalReviews(): Promise<ActionResult<{ reviews: PortalReview[]; pending: PortalPendingReview[] }>> {
  try {
    const clientResult = await getPortalClient()
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: clientResult.error }
    }
    const supabase = createAdminClient()
    const clientId = clientResult.data.clientId

    // Past reviews
    const { data: ratings } = await supabase
      .from('job_ratings')
      .select('id, job_id, company_id, rating, review, response, created_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    // Get company names
    const companyIds = [...new Set((ratings ?? []).map(r => r.company_id))]
    const { data: companies } = companyIds.length > 0
      ? await supabase.from('companies').select('id, name').in('id', companyIds)
      : { data: [] }
    const companyMap = new Map((companies ?? []).map(c => [c.id, c.name]))

    // Get job service names
    const jobIds = [...new Set((ratings ?? []).map(r => r.job_id))]
    const { data: jobs } = jobIds.length > 0
      ? await supabase.from('jobs').select('id, service_type_id').in('id', jobIds)
      : { data: [] }
    const serviceTypeIds = [...new Set((jobs ?? []).map(j => j.service_type_id))]
    const { data: services } = serviceTypeIds.length > 0
      ? await supabase.from('service_types').select('id, name').in('id', serviceTypeIds)
      : { data: [] }
    const serviceMap = new Map((services ?? []).map(s => [s.id, s.name]))
    const jobServiceMap = new Map((jobs ?? []).map(j => [j.id, serviceMap.get(j.service_type_id) ?? 'Service']))

    const reviews: PortalReview[] = (ratings ?? []).map(r => ({
      id: r.id,
      jobId: r.job_id,
      serviceName: jobServiceMap.get(r.job_id) ?? 'Service',
      companyName: companyMap.get(r.company_id) ?? 'Provider',
      rating: r.rating,
      review: r.review ?? null,
      response: r.response ?? null,
      createdAt: r.created_at,
    }))

    // Pending reviews: completed jobs without a rating
    const { data: addresses } = await supabase
      .from('addresses')
      .select('id, street, city')
      .eq('client_id', clientId)

    const addressIds = (addresses ?? []).map(a => a.id)
    const addressMap = new Map((addresses ?? []).map(a => [a.id, `${a.street}, ${a.city}`]))

    const ratedJobIds = new Set((ratings ?? []).map(r => r.job_id))

    const { data: completedJobs } = addressIds.length > 0
      ? await supabase
          .from('jobs')
          .select('id, company_id, address_id, service_type_id, scheduled_date')
          .in('address_id', addressIds)
          .in('status', ['completed', 'charged'])
          .order('scheduled_date', { ascending: false })
          .limit(20)
      : { data: [] }

    const pendingJobs = (completedJobs ?? []).filter(j => !ratedJobIds.has(j.id))

    // Resolve company/service names for pending
    const pendingCompanyIds = [...new Set(pendingJobs.map(j => j.company_id))]
    const { data: pendingCompanies } = pendingCompanyIds.length > 0
      ? await supabase.from('companies').select('id, name').in('id', pendingCompanyIds)
      : { data: [] }
    const pendingCompanyMap = new Map((pendingCompanies ?? []).map(c => [c.id, c.name]))

    const pendingServiceIds = [...new Set(pendingJobs.map(j => j.service_type_id))]
    const { data: pendingServices } = pendingServiceIds.length > 0
      ? await supabase.from('service_types').select('id, name').in('id', pendingServiceIds)
      : { data: [] }
    const pendingServiceMap = new Map((pendingServices ?? []).map(s => [s.id, s.name]))

    const pending: PortalPendingReview[] = pendingJobs.map(j => ({
      jobId: j.id,
      serviceName: pendingServiceMap.get(j.service_type_id) ?? 'Service',
      companyName: pendingCompanyMap.get(j.company_id) ?? 'Provider',
      scheduledDate: j.scheduled_date,
      address: addressMap.get(j.address_id) ?? 'Unknown',
    }))

    return { success: true, data: { reviews, pending } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load reviews' }
  }
}

export async function submitPortalReview(data: {
  jobId: string
  rating: number
  review?: string
}): Promise<ActionResult> {
  try {
    const clientResult = await getPortalClient()
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: clientResult.error }
    }
    const supabase = createAdminClient()

    // Get job's company_id
    const { data: job } = await supabase
      .from('jobs')
      .select('company_id')
      .eq('id', data.jobId)
      .single()

    if (!job) return { success: false, error: 'Job not found' }

    const { error } = await supabase.from('job_ratings').insert({
      job_id: data.jobId,
      company_id: job.company_id,
      client_id: clientResult.data.clientId,
      rating: data.rating,
      review: data.review || null,
    })

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to submit review' }
  }
}

// ─── Providers ──────────────────────────────────────────────────────

export type PortalProvider = {
  companyId: string
  companyName: string
  phone: string | null
  email: string | null
  slug: string
  createdAt: string
}

export async function getPortalProviders(): Promise<ActionResult<PortalProvider[]>> {
  try {
    const clientResult = await getPortalClient()
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: clientResult.error }
    }
    const supabase = createAdminClient()

    const { data: clientCompanies } = await supabase
      .from('client_companies')
      .select('company_id, created_at')
      .eq('client_id', clientResult.data.clientId)

    if (!clientCompanies || clientCompanies.length === 0) {
      return { success: true, data: [] }
    }

    const companyIds = clientCompanies.map(cc => cc.company_id)
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name, phone, email, slug')
      .in('id', companyIds)

    const ccMap = new Map(clientCompanies.map(cc => [cc.company_id, cc.created_at]))

    return {
      success: true,
      data: (companies ?? []).map(c => ({
        companyId: c.id,
        companyName: c.name,
        phone: c.phone,
        email: c.email,
        slug: c.slug,
        createdAt: ccMap.get(c.id) ?? '',
      })),
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load providers' }
  }
}

// ─── Messages ───────────────────────────────────────────────────────

export type PortalConversation = {
  companyId: string
  companyName: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

export type PortalMessage = {
  id: string
  senderId: string
  senderRole: string
  content: string
  createdAt: string
}

export async function getPortalConversations(): Promise<ActionResult<PortalConversation[]>> {
  try {
    const clientResult = await getPortalClient()
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: clientResult.error }
    }
    const supabase = createAdminClient()

    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, company_id, sender_role, content, read_at, created_at')
      .eq('client_id', clientResult.data.clientId)
      .order('created_at', { ascending: false })

    if (error) return { success: false, error: error.message }
    if (!messages || messages.length === 0) return { success: true, data: [] }

    const companyIds = [...new Set(messages.map(m => m.company_id))]
    const { data: companies } = await supabase.from('companies').select('id, name').in('id', companyIds)
    const companyMap = new Map((companies ?? []).map(c => [c.id, c.name]))

    // Group by company
    const grouped = new Map<string, typeof messages>()
    for (const msg of messages) {
      const existing = grouped.get(msg.company_id) ?? []
      grouped.set(msg.company_id, [...existing, msg])
    }

    const conversations: PortalConversation[] = []
    for (const [companyId, msgs] of grouped) {
      const latest = msgs[0]
      const unreadCount = msgs.filter(m => !m.read_at && m.sender_role !== 'client').length
      conversations.push({
        companyId,
        companyName: companyMap.get(companyId) ?? 'Provider',
        lastMessage: latest.content,
        lastMessageAt: latest.created_at,
        unreadCount,
      })
    }

    conversations.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
    return { success: true, data: conversations }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load conversations' }
  }
}

export async function getPortalThread(companyId: string): Promise<ActionResult<{ companyName: string; messages: PortalMessage[] }>> {
  try {
    const clientResult = await getPortalClient()
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: clientResult.error }
    }
    const supabase = createAdminClient()

    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, sender_id, sender_role, content, created_at')
      .eq('client_id', clientResult.data.clientId)
      .eq('company_id', companyId)
      .order('created_at', { ascending: true })

    if (error) return { success: false, error: error.message }

    const { data: company } = await supabase.from('companies').select('name').eq('id', companyId).single()

    // Mark unread messages as read
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('client_id', clientResult.data.clientId)
      .eq('company_id', companyId)
      .is('read_at', null)
      .neq('sender_role', 'client')

    return {
      success: true,
      data: {
        companyName: company?.name ?? 'Provider',
        messages: (messages ?? []).map(m => ({
          id: m.id,
          senderId: m.sender_id,
          senderRole: m.sender_role,
          content: m.content,
          createdAt: m.created_at,
        })),
      },
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load thread' }
  }
}

export async function sendPortalMessage(companyId: string, content: string): Promise<ActionResult<{ id: string }>> {
  try {
    const clientResult = await getPortalClient()
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: clientResult.error }
    }
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('messages')
      .insert({
        company_id: companyId,
        client_id: clientResult.data.clientId,
        sender_id: clientResult.data.userId,
        sender_role: 'client',
        content,
        channel: 'in_app',
      })
      .select('id')
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, data: { id: data.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to send message' }
  }
}

// ─── Documents (addresses) ──────────────────────────────────────────

export type PortalAddress = {
  id: string
  display: string
  documents: Array<{ name: string; url: string; uploadedAt: string }> | null
}

export async function getPortalDocuments(): Promise<ActionResult<PortalAddress[]>> {
  try {
    const clientResult = await getPortalClient()
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: clientResult.error }
    }
    const supabase = createAdminClient()

    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('id, street, city, state, zip, documents')
      .eq('client_id', clientResult.data.clientId)
      .order('street')

    if (error) return { success: false, error: error.message }

    return {
      success: true,
      data: (addresses ?? []).map(a => ({
        id: a.id,
        display: `${a.street}, ${a.city}, ${a.state} ${a.zip}`,
        documents: Array.isArray(a.documents)
          ? (a.documents as Array<{ name: string; url: string; uploadedAt: string }>)
          : null,
      })),
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load documents' }
  }
}

// ─── Contracts ──────────────────────────────────────────────────────

export type PortalContract = {
  id: string
  title: string
  content: string | null
  companyName: string
  status: string
  signedAt: string | null
  createdAt: string
}

export async function getPortalContracts(): Promise<ActionResult<PortalContract[]>> {
  try {
    const clientResult = await getPortalClient()
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: clientResult.error }
    }
    const supabase = createAdminClient()

    const { data: contracts, error } = await supabase
      .from('contracts')
      .select('id, company_id, title, content, status, signed_at, created_at')
      .eq('client_id', clientResult.data.clientId)
      .order('created_at', { ascending: false })

    if (error) return { success: false, error: error.message }

    const companyIds = [...new Set((contracts ?? []).map(c => c.company_id))]
    const { data: companies } = companyIds.length > 0
      ? await supabase.from('companies').select('id, name').in('id', companyIds)
      : { data: [] }
    const companyMap = new Map((companies ?? []).map(c => [c.id, c.name]))

    return {
      success: true,
      data: (contracts ?? []).map(c => ({
        id: c.id,
        title: c.title,
        content: c.content,
        companyName: companyMap.get(c.company_id) ?? 'Provider',
        status: c.status,
        signedAt: c.signed_at,
        createdAt: c.created_at,
      })),
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load contracts' }
  }
}

export async function signPortalContract(contractId: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('contracts')
      .update({ status: 'signed', signed_at: new Date().toISOString() })
      .eq('id', contractId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to sign contract' }
  }
}

// ─── Settings ───────────────────────────────────────────────────────

export async function updatePortalProfile(data: {
  fullName?: string
  email?: string
  phone?: string
}): Promise<ActionResult> {
  try {
    const clientResult = await getPortalClient()
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: clientResult.error }
    }
    const supabase = createAdminClient()

    const update: Record<string, unknown> = {}
    if (data.fullName !== undefined) update.full_name = data.fullName.trim()
    if (data.email !== undefined) update.email = data.email.trim()
    if (data.phone !== undefined) update.phone = data.phone.trim() || null

    if (Object.keys(update).length === 0) return { success: true }

    const { error } = await supabase
      .from('users')
      .update(update)
      .eq('id', clientResult.data.userId)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update profile' }
  }
}

export type PortalSettingsData = {
  client: PortalClient
  addresses: Array<{ id: string; display: string }>
}

export async function getPortalSettings(): Promise<ActionResult<PortalSettingsData>> {
  try {
    const clientResult = await getPortalClient()
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: clientResult.error }
    }
    const supabase = createAdminClient()

    const { data: addresses } = await supabase
      .from('addresses')
      .select('id, street, city, state, zip')
      .eq('client_id', clientResult.data.clientId)
      .eq('status', 'active')

    return {
      success: true,
      data: {
        client: clientResult.data,
        addresses: (addresses ?? []).map(a => ({
          id: a.id,
          display: `${a.street}, ${a.city}, ${a.state} ${a.zip}`,
        })),
      },
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load settings' }
  }
}

// ─── Upload document to address ──────────────────────────────────

export async function uploadPortalDocument(
  addressId: string,
  doc: { name: string; url: string }
): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()

    // Fetch existing documents
    const { data: address, error: fetchErr } = await supabase
      .from('addresses')
      .select('documents')
      .eq('id', addressId)
      .single()

    if (fetchErr || !address) {
      return { success: false, error: 'Address not found' }
    }

    const existingDocs = Array.isArray(address.documents) ? address.documents : []
    const updatedDocs = [
      ...existingDocs,
      { name: doc.name, url: doc.url, uploadedAt: new Date().toISOString() },
    ]

    const { error } = await supabase
      .from('addresses')
      .update({ documents: updatedDocs })
      .eq('id', addressId)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to upload document' }
  }
}

// ─── Leave provider ─────────────────────────────────────────────

export async function leaveProvider(companyId: string): Promise<ActionResult> {
  try {
    const clientResult = await getPortalClient()
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: clientResult.error }
    }
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('client_companies')
      .delete()
      .eq('client_id', clientResult.data.clientId)
      .eq('company_id', companyId)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to leave provider' }
  }
}

// ─── Pay all outstanding invoices ───────────────────────────────

export async function payAllOutstanding(): Promise<ActionResult<{ count: number }>> {
  try {
    const clientResult = await getPortalClient()
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: clientResult.error }
    }
    const supabase = createAdminClient()

    const { data: invoices, error: fetchErr } = await supabase
      .from('invoices')
      .select('id')
      .eq('client_id', clientResult.data.clientId)
      .in('status', ['pending', 'overdue'])

    if (fetchErr) return { success: false, error: fetchErr.message }

    const ids = (invoices ?? []).map(i => i.id)
    if (ids.length === 0) return { success: true, data: { count: 0 } }

    const { error } = await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .in('id', ids)

    if (error) return { success: false, error: error.message }
    return { success: true, data: { count: ids.length } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to pay invoices' }
  }
}
