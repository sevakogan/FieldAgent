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
  worker_name: string | null
  status: JobStatus
  scheduled_date: string
  scheduled_time: string | null
  price: number
  source: string
  created_at: string
}

export type JobDetail = Job & {
  address_street: string
  address_unit: string | null
  address_city: string
  address_state: string
  address_zip: string
  service_name: string
  service_description: string | null
  worker_name: string | null
  worker_id: string | null
}

export type TeamMember = {
  member_id: string
  user_id: string
  full_name: string
  role: string
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
        .select('id, street, city')
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
      (addressResult.data ?? []).map(a => [a.id, { street: a.street, city: a.city }])
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

    const rows: JobRow[] = jobs.map(job => {
      const addr = addressMap.get(job.address_id)
      return {
        id: job.id,
        address_street: addr?.street ?? 'Unknown',
        address_city: addr?.city ?? '',
        service_name: serviceMap.get(job.service_type_id) ?? 'Unknown',
        worker_name: job.assigned_worker_id ? (memberNameMap.get(job.assigned_worker_id) ?? null) : null,
        status: job.status as JobStatus,
        scheduled_date: job.scheduled_date,
        scheduled_time: job.scheduled_time,
        price: job.price,
        source: job.source,
        created_at: job.created_at,
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

    // Fetch service
    const { data: service } = await supabase
      .from('service_types')
      .select('name, description')
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

    const detail: JobDetail = {
      ...(job as Job),
      address_street: address?.street ?? 'Unknown',
      address_unit: address?.unit ?? null,
      address_city: address?.city ?? '',
      address_state: address?.state ?? '',
      address_zip: address?.zip ?? '',
      service_name: service?.name ?? 'Unknown',
      service_description: service?.description ?? null,
      worker_name: workerName,
      worker_id: job.assigned_worker_id,
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

export async function getTeamMembers(): Promise<ActionResult<TeamMember[]>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data: members, error: membersError } = await supabase
      .from('company_members')
      .select('id, user_id, role')
      .eq('company_id', companyId)
      .eq('status', 'active')

    if (membersError) {
      return { success: false, error: membersError.message }
    }

    if (!members || members.length === 0) {
      return { success: true, data: [] }
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

    const teamMembers: TeamMember[] = members.map(m => ({
      member_id: m.id,
      user_id: m.user_id,
      full_name: userMap.get(m.user_id) ?? 'Unknown',
      role: m.role,
    }))

    return { success: true, data: teamMembers }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch team members' }
  }
}
