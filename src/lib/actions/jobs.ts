'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanyId } from '@/lib/actions/bootstrap'
import type { Job, JobStatus } from '@/types/database'

export type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export type JobRow = {
  id: string
  address_street: string
  address_city: string
  service_name: string
  assigned_worker_id: string | null
  worker_name: string | null
  status: JobStatus
  scheduled_date: string
  scheduled_time: string | null
  price: number
  source: string
  created_at: string
  client_id: string | null
  client_name: string | null
  client_phone: string | null
}

export type JobDetail = Job & {
  address_street: string
  address_unit: string | null
  address_city: string
  address_state: string
  address_zip: string
  service_name: string
  service_description: string | null
  service_checklist_items: unknown[] | null
  worker_name: string | null
  worker_id: string | null
  client_id: string | null
  client_name: string | null
  client_phone: string | null
}

export type TeamMember = {
  member_id: string
  user_id: string
  full_name: string
  role: string
  is_current_user?: boolean
}

export type TeamMembersResult = {
  members: TeamMember[]
  currentMemberId: string | null
}

export async function getJobs(filters?: {
  status?: string
  date?: string
}): Promise<ActionResult<JobRow[]>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    let query = supabase
      .from('jobs')
      .select('id, address_id, service_type_id, assigned_worker_id, status, scheduled_date, scheduled_time, price, source, created_at')
      .eq('company_id', companyId)
      .order('scheduled_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    if (filters?.date) {
      query = query.eq('scheduled_date', filters.date)
    }

    const { data: jobs, error: jobsError } = await query

    if (jobsError) {
      return { success: false, error: jobsError.message }
    }

    if (!jobs || jobs.length === 0) {
      return { success: true, data: [] }
    }

    // Batch-fetch related data
    const addressIds = [...new Set(jobs.map(j => j.address_id))]
    const serviceIds = [...new Set(jobs.map(j => j.service_type_id))]
    const workerIds = [...new Set(jobs.filter(j => j.assigned_worker_id).map(j => j.assigned_worker_id!))]

    const [addressResult, serviceResult, memberResult] = await Promise.all([
      supabase
        .from('addresses')
        .select('id, street, city, client_id')
        .in('id', addressIds),
      supabase
        .from('service_types')
        .select('id, name')
        .in('id', serviceIds),
      workerIds.length > 0
        ? supabase
            .from('company_members')
            .select('id, user_id')
            .in('id', workerIds)
        : Promise.resolve({ data: [], error: null }),
    ])

    const addressMap = new Map(
      (addressResult.data ?? []).map(a => [a.id, { street: a.street, city: a.city, client_id: a.client_id }])
    )
    const serviceMap = new Map(
      (serviceResult.data ?? []).map(s => [s.id, s.name])
    )

    // Resolve member user_ids to names
    const memberUserIds = (memberResult.data ?? []).map(m => m.user_id)
    let userNameMap = new Map<string, string>()

    if (memberUserIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', memberUserIds)

      userNameMap = new Map((users ?? []).map(u => [u.id, u.full_name]))
    }

    const memberNameMap = new Map(
      (memberResult.data ?? []).map(m => [m.id, userNameMap.get(m.user_id) ?? 'Unknown'])
    )

    // Resolve client_id -> user_id -> (full_name, phone) for each address
    const clientIds = [...new Set(
      (addressResult.data ?? []).filter(a => a.client_id).map(a => a.client_id!)
    )]

    let clientUserMap = new Map<string, { name: string; phone: string | null }>()

    if (clientIds.length > 0) {
      const { data: clients } = await supabase
        .from('clients')
        .select('id, user_id')
        .in('id', clientIds)

      const clientUserIds = (clients ?? []).filter(c => c.user_id).map(c => c.user_id!)
      if (clientUserIds.length > 0) {
        const { data: clientUsers } = await supabase
          .from('users')
          .select('id, full_name, phone')
          .in('id', clientUserIds)

        const clientUserDataMap = new Map(
          (clientUsers ?? []).map(u => [u.id, { name: u.full_name, phone: u.phone }])
        )

        for (const client of (clients ?? [])) {
          if (client.user_id) {
            const userData = clientUserDataMap.get(client.user_id)
            if (userData) {
              clientUserMap = new Map([...clientUserMap, [client.id, userData]])
            }
          }
        }
      }
    }

    const rows: JobRow[] = jobs.map(job => {
      const addr = addressMap.get(job.address_id)
      const clientData = addr?.client_id ? clientUserMap.get(addr.client_id) : null
      return {
        id: job.id,
        address_street: addr?.street ?? 'Unknown',
        address_city: addr?.city ?? '',
        service_name: serviceMap.get(job.service_type_id) ?? 'Unknown',
        assigned_worker_id: job.assigned_worker_id ?? null,
        worker_name: job.assigned_worker_id ? (memberNameMap.get(job.assigned_worker_id) ?? null) : null,
        status: job.status as JobStatus,
        scheduled_date: job.scheduled_date,
        scheduled_time: job.scheduled_time,
        price: job.price,
        source: job.source,
        created_at: job.created_at,
        client_id: addr?.client_id ?? null,
        client_name: clientData?.name ?? null,
        client_phone: clientData?.phone ?? null,
      }
    })

    return { success: true, data: rows }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch jobs' }
  }
}

export async function getJob(id: string): Promise<ActionResult<JobDetail>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('company_id', companyId)
      .single()

    if (jobError || !job) {
      return { success: false, error: jobError?.message ?? 'Job not found' }
    }

    // Fetch address
    const { data: address } = await supabase
      .from('addresses')
      .select('street, unit, city, state, zip')
      .eq('id', job.address_id)
      .single()

    // Fetch service (including checklist_items)
    const { data: service } = await supabase
      .from('service_types')
      .select('name, description, checklist_items')
      .eq('id', job.service_type_id)
      .single()

    // Fetch worker name
    let workerName: string | null = null
    if (job.assigned_worker_id) {
      const { data: member } = await supabase
        .from('company_members')
        .select('user_id')
        .eq('id', job.assigned_worker_id)
        .single()

      if (member) {
        const { data: user } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', member.user_id)
          .single()

        workerName = user?.full_name ?? null
      }
    }

    // Fetch client info from address
    let clientId: string | null = null
    let clientName: string | null = null
    let clientPhone: string | null = null
    if (address) {
      const { data: addrRow } = await supabase.from('addresses').select('client_id').eq('id', job.address_id).single()
      if (addrRow?.client_id) {
        clientId = addrRow.client_id
        const { data: clientRow } = await supabase.from('clients').select('user_id').eq('id', addrRow.client_id).single()
        if (clientRow?.user_id) {
          const { data: clientUser } = await supabase.from('users').select('full_name, phone').eq('id', clientRow.user_id).single()
          clientName = clientUser?.full_name ?? null
          clientPhone = clientUser?.phone ?? null
        }
      }
    }

    const detail: JobDetail = {
      ...(job as Job),
      address_street: address?.street ?? 'Unknown',
      address_unit: address?.unit ?? null,
      address_city: address?.city ?? '',
      address_state: address?.state ?? '',
      address_zip: address?.zip ?? '',
      service_name: service?.name ?? 'Unknown',
      service_description: service?.description ?? null,
      service_checklist_items: (service as Record<string, unknown>)?.checklist_items as unknown[] ?? null,
      worker_name: workerName,
      worker_id: job.assigned_worker_id,
      client_id: clientId,
      client_name: clientName,
      client_phone: clientPhone,
    }

    return { success: true, data: detail }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch job' }
  }
}

export async function createJob(data: {
  address_id: string
  service_type_id: string
  assigned_worker_id?: string
  scheduled_date: string
  scheduled_time?: string
  price: number
  source?: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    if (!data.address_id) {
      return { success: false, error: 'Address is required' }
    }
    if (!data.service_type_id) {
      return { success: false, error: 'Service type is required' }
    }
    if (!data.scheduled_date) {
      return { success: false, error: 'Scheduled date is required' }
    }
    if (data.price < 0) {
      return { success: false, error: 'Price must be a positive number' }
    }

    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        company_id: companyId,
        address_id: data.address_id,
        service_type_id: data.service_type_id,
        assigned_worker_id: data.assigned_worker_id || null,
        scheduled_date: data.scheduled_date,
        scheduled_time: data.scheduled_time || null,
        price: data.price,
        source: data.source ?? 'manual_company',
        status: 'scheduled',
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

    if (error || !job) {
      return { success: false, error: `Failed to create job: ${error?.message}` }
    }

    // Auto-create pending invoice for this job
    try {
      // Get full context for the invoice: address, client, service
      const [addressRes, serviceRes] = await Promise.all([
        supabase.from('addresses').select('client_id, street, city, state, zip').eq('id', data.address_id).single(),
        supabase.from('service_types').select('name').eq('id', data.service_type_id).single(),
      ])

      const address = addressRes.data
      const serviceName = serviceRes.data?.name ?? 'Service'

      if (address?.client_id) {
        // Get client name
        const { data: clientRecord } = await supabase.from('clients').select('user_id').eq('id', address.client_id).single()
        let clientName = 'Client'
        if (clientRecord?.user_id) {
          const { data: user } = await supabase.from('users').select('full_name').eq('id', clientRecord.user_id).single()
          clientName = user?.full_name ?? 'Client'
        }

        // Get company name
        const { data: company } = await supabase.from('companies').select('name').eq('id', companyId).single()

        const addressLine = `${address.street}, ${address.city}, ${address.state} ${address.zip}`
        const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`

        await supabase.from('invoices').insert({
          company_id: companyId,
          client_id: address.client_id,
          job_id: job.id,
          invoice_number: invoiceNumber,
          subtotal: data.price,
          expenses_total: 0,
          tax_amount: 0,
          tip_amount: 0,
          processing_fee: 0,
          total: data.price,
          status: 'pending',
          due_date: data.scheduled_date,
          items: JSON.stringify({
            from: company?.name ?? 'Company',
            to: clientName,
            address: addressLine,
            scheduled_date: data.scheduled_date,
            scheduled_time: data.scheduled_time ?? null,
            line_items: [{
              description: serviceName,
              address: addressLine,
              quantity: 1,
              unit_price: data.price,
              total: data.price,
            }],
          }),
        })
      }
    } catch (invoiceErr) {
      // Log but don't fail the job creation
      console.error('Auto-invoice creation failed:', invoiceErr)
    }

    return { success: true, data: { id: job.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create job' }
  }
}

export async function updateJob(
  id: string,
  data: {
    address_id?: string
    service_type_id?: string
    assigned_worker_id?: string | null
    scheduled_date?: string
    scheduled_time?: string | null
    price?: number
    status?: string
    cancellation_reason?: string
    checklist_results?: Record<string, boolean>
    custom_field_values?: Record<string, unknown>
    expenses_total?: number
  }
): Promise<ActionResult> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const update: Record<string, unknown> = {}
    if (data.address_id !== undefined) update.address_id = data.address_id
    if (data.service_type_id !== undefined) update.service_type_id = data.service_type_id
    if (data.assigned_worker_id !== undefined) update.assigned_worker_id = data.assigned_worker_id
    if (data.scheduled_date !== undefined) update.scheduled_date = data.scheduled_date
    if (data.scheduled_time !== undefined) update.scheduled_time = data.scheduled_time
    if (data.price !== undefined) update.price = data.price
    if (data.status !== undefined) update.status = data.status
    if (data.cancellation_reason !== undefined) update.cancellation_reason = data.cancellation_reason
    if (data.checklist_results !== undefined) update.checklist_results = data.checklist_results
    if (data.custom_field_values !== undefined) update.custom_field_values = data.custom_field_values
    if (data.expenses_total !== undefined) update.expenses_total = data.expenses_total

    if (Object.keys(update).length === 0) {
      return { success: true }
    }

    const { error } = await supabase
      .from('jobs')
      .update(update)
      .eq('id', id)
      .eq('company_id', companyId)

    if (error) {
      return { success: false, error: `Failed to update job: ${error.message}` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update job' }
  }
}

export async function updateJobStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    // Build update with timestamp fields
    const updateData: Record<string, unknown> = { status }
    const now = new Date().toISOString()

    if (status === 'driving') updateData.drive_started_at = now
    if (status === 'arrived') updateData.arrived_at = now
    if (status === 'in_progress') updateData.started_at = now
    if (status === 'completed') updateData.ended_at = now

    const { error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .eq('company_id', companyId)

    if (error) {
      return { success: false, error: `Failed to update job status: ${error.message}` }
    }

    // When job moves to pending_review → invoice stays pending (waiting for client approval)
    // When job is completed → update the invoice total with final amounts (expenses, tips)
    if (status === 'completed' || status === 'charged') {
      try {
        // Get job details for final total
        const { data: job } = await supabase
          .from('jobs')
          .select('price, expenses_total, tax_amount, tip_amount')
          .eq('id', id)
          .single()

        if (job) {
          const finalTotal = (job.price ?? 0) + (job.expenses_total ?? 0) + (job.tax_amount ?? 0) + (job.tip_amount ?? 0)

          await supabase
            .from('invoices')
            .update({
              subtotal: job.price,
              expenses_total: job.expenses_total ?? 0,
              tax_amount: job.tax_amount ?? 0,
              tip_amount: job.tip_amount ?? 0,
              total: finalTotal,
              ...(status === 'charged' ? { status: 'paid', paid_at: now } : {}),
            })
            .eq('job_id', id)
            .eq('status', 'pending')
        }
      } catch (invoiceErr) {
        console.error('Invoice update on job status change failed:', invoiceErr)
      }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update job status' }
  }
}

export async function deleteJob(id: string): Promise<ActionResult> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)
      .eq('company_id', companyId)

    if (error) {
      return { success: false, error: `Failed to delete job: ${error.message}` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete job' }
  }
}

export async function getTeamMembers(): Promise<ActionResult<TeamMembersResult>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    // Get the current authenticated user
    const { createClient: createServerClient } = await import('@/lib/supabase/server')
    const serverClient = await createServerClient()
    const { data: { user: authUser } } = await serverClient.auth.getUser()
    const currentUserId = authUser?.id ?? null

    const { data: members, error: membersError } = await supabase
      .from('company_members')
      .select('id, user_id, role')
      .eq('company_id', companyId)
      .eq('status', 'active')

    if (membersError) {
      return { success: false, error: membersError.message }
    }

    if (!members || members.length === 0) {
      return { success: true, data: { members: [], currentMemberId: null } }
    }

    const userIds = members.map(m => m.user_id)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name')
      .in('id', userIds)

    if (usersError) {
      return { success: false, error: usersError.message }
    }

    const userMap = new Map((users ?? []).map(u => [u.id, u.full_name]))

    let currentMemberId: string | null = null
    const teamMembers: TeamMember[] = members.map(m => {
      const isCurrent = m.user_id === currentUserId
      if (isCurrent) currentMemberId = m.id
      return {
        member_id: m.id,
        user_id: m.user_id,
        full_name: userMap.get(m.user_id) ?? 'Unknown',
        role: m.role,
        is_current_user: isCurrent,
      }
    })

    // Sort: current user first, then alphabetically
    teamMembers.sort((a, b) => {
      if (a.is_current_user) return -1
      if (b.is_current_user) return 1
      return a.full_name.localeCompare(b.full_name)
    })

    return { success: true, data: { members: teamMembers, currentMemberId } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch team members' }
  }
}

// ─── Worker Mode: Today's Jobs ──────────────────────────────────────
export type WorkerJob = {
  id: string
  service_name: string
  address_street: string
  address_city: string
  client_name: string | null
  client_phone: string | null
  scheduled_time: string | null
  price: number
  status: JobStatus
}

export async function getWorkerJobs(): Promise<ActionResult<WorkerJob[]>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const today = new Date().toISOString().split('T')[0]

    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, address_id, service_type_id, status, scheduled_time, price')
      .eq('company_id', companyId)
      .eq('scheduled_date', today)
      .not('status', 'eq', 'cancelled')
      .order('scheduled_time', { ascending: true })

    if (jobsError) return { success: false, error: jobsError.message }
    if (!jobs || jobs.length === 0) return { success: true, data: [] }

    // Batch-fetch related data
    const addressIds = [...new Set(jobs.map(j => j.address_id))]
    const serviceIds = [...new Set(jobs.map(j => j.service_type_id))]

    const [addressResult, serviceResult] = await Promise.all([
      supabase.from('addresses').select('id, street, city, client_id').in('id', addressIds),
      supabase.from('service_types').select('id, name').in('id', serviceIds),
    ])

    const addressMap = new Map(
      (addressResult.data ?? []).map(a => [a.id, { street: a.street, city: a.city, client_id: a.client_id }])
    )
    const serviceMap = new Map(
      (serviceResult.data ?? []).map(s => [s.id, s.name])
    )

    // Resolve client names + phones
    const clientIds = [...new Set(
      (addressResult.data ?? []).filter(a => a.client_id).map(a => a.client_id!)
    )]

    let clientUserMap = new Map<string, { name: string; phone: string | null }>()

    if (clientIds.length > 0) {
      const { data: clients } = await supabase
        .from('clients')
        .select('id, user_id')
        .in('id', clientIds)

      const userIds = (clients ?? []).map(c => c.user_id)
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id, full_name, phone')
          .in('id', userIds)
        const userMap = new Map((users ?? []).map(u => [u.id, { name: u.full_name, phone: u.phone }]))
        clientUserMap = new Map(
          (clients ?? []).map(c => [c.id, userMap.get(c.user_id) ?? { name: 'Unknown', phone: null }])
        )
      }
    }

    const rows: WorkerJob[] = jobs.map(job => {
      const addr = addressMap.get(job.address_id)
      const clientData = addr?.client_id ? clientUserMap.get(addr.client_id) : null
      return {
        id: job.id,
        service_name: serviceMap.get(job.service_type_id) ?? 'Unknown',
        address_street: addr?.street ?? 'Unknown',
        address_city: addr?.city ?? '',
        client_name: clientData?.name ?? null,
        client_phone: clientData?.phone ?? null,
        scheduled_time: job.scheduled_time,
        price: job.price ?? 0,
        status: job.status,
      }
    })

    return { success: true, data: rows }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch worker jobs' }
  }
}

export async function duplicateJob(jobId: string, newDate?: string): Promise<ActionResult<{ id: string }>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data: original, error: fetchErr } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('company_id', companyId)
      .single()

    if (fetchErr || !original) return { success: false, error: 'Job not found' }

    const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = original
    const { data: newJob, error: insertErr } = await supabase
      .from('jobs')
      .insert({
        ...rest,
        scheduled_date: newDate ?? original.scheduled_date,
        status: 'scheduled',
        drive_started_at: null, arrived_at: null, started_at: null, ended_at: null,
      })
      .select('id')
      .single()

    if (insertErr) return { success: false, error: insertErr.message }
    return { success: true, data: { id: newJob.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to duplicate' }
  }
}
