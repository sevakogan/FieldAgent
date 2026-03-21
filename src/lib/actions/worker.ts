'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanyId } from '@/lib/actions/bootstrap'
import type { JobStatus } from '@/types/database'

export type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export type WorkerInfo = {
  memberId: string
  userId: string
  fullName: string
  email: string
  phone: string | null
  avatarUrl: string | null
  role: string
  payType: string | null
  payRate: number | null
  joinedAt: string
}

export type WorkerJobRow = {
  id: string
  street: string
  city: string
  state: string
  zip: string
  serviceName: string
  status: JobStatus
  scheduledDate: string
  scheduledTime: string | null
  price: number
  tipAmount: number
  startedAt: string | null
  endedAt: string | null
  estimatedDuration: number | null
}

export type WorkerJobDetail = WorkerJobRow & {
  unit: string | null
  serviceDescription: string | null
  checklistItems: unknown[]
  checklistResults: Record<string, unknown> | null
  driveStartedAt: string | null
  arrivedAt: string | null
}

export type WorkerProfileStats = {
  totalJobs: number
  avgRating: number | null
  totalEarned: number
}

export type CompletedJobRow = WorkerJobRow & {
  rating: number | null
  review: string | null
}

async function getWorkerMember(): Promise<{ memberId: string; userId: string } | null> {
  const companyId = await getCompanyId()
  const supabase = createAdminClient()

  const { data: member } = await supabase
    .from('company_members')
    .select('id, user_id, role')
    .eq('company_id', companyId)
    .in('role', ['worker', 'owner'])
    .eq('status', 'active')
    .order('role', { ascending: true }) // 'owner' comes after 'worker' alphabetically — we want worker first
    .limit(1)
    .single()

  if (!member) return null
  return { memberId: member.id, userId: member.user_id }
}

export async function getWorkerInfo(): Promise<ActionResult<WorkerInfo>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()
    const worker = await getWorkerMember()

    if (!worker) {
      return { success: false, error: 'No worker found' }
    }

    const [memberResult, userResult] = await Promise.all([
      supabase
        .from('company_members')
        .select('id, user_id, role, pay_type, pay_rate, created_at')
        .eq('id', worker.memberId)
        .eq('company_id', companyId)
        .single(),
      supabase
        .from('users')
        .select('id, full_name, email, phone, avatar_url')
        .eq('id', worker.userId)
        .single(),
    ])

    if (memberResult.error || !memberResult.data) {
      return { success: false, error: memberResult.error?.message ?? 'Member not found' }
    }
    if (userResult.error || !userResult.data) {
      return { success: false, error: userResult.error?.message ?? 'User not found' }
    }

    const m = memberResult.data
    const u = userResult.data

    return {
      success: true,
      data: {
        memberId: m.id,
        userId: m.user_id,
        fullName: u.full_name,
        email: u.email,
        phone: u.phone,
        avatarUrl: u.avatar_url,
        role: m.role,
        payType: m.pay_type,
        payRate: m.pay_rate,
        joinedAt: m.created_at,
      },
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch worker info' }
  }
}

export async function getWorkerTodayJobs(): Promise<ActionResult<WorkerJobRow[]>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()
    const worker = await getWorkerMember()

    if (!worker) {
      return { success: true, data: [] }
    }

    const today = new Date().toISOString().split('T')[0]

    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, address_id, service_type_id, status, scheduled_date, scheduled_time, price, tip_amount, started_at, ended_at')
      .eq('company_id', companyId)
      .eq('assigned_worker_id', worker.memberId)
      .eq('scheduled_date', today)
      .order('scheduled_time', { ascending: true })

    if (jobsError) {
      return { success: false, error: jobsError.message }
    }

    if (!jobs || jobs.length === 0) {
      return { success: true, data: [] }
    }

    return enrichJobRows(supabase, jobs)
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch today jobs' }
  }
}

export async function getWorkerMonthJobs(year: number, month: number): Promise<ActionResult<WorkerJobRow[]>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()
    const worker = await getWorkerMember()

    if (!worker) {
      return { success: true, data: [] }
    }

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, address_id, service_type_id, status, scheduled_date, scheduled_time, price, tip_amount, started_at, ended_at')
      .eq('company_id', companyId)
      .eq('assigned_worker_id', worker.memberId)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })

    if (jobsError) {
      return { success: false, error: jobsError.message }
    }

    if (!jobs || jobs.length === 0) {
      return { success: true, data: [] }
    }

    return enrichJobRows(supabase, jobs)
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch month jobs' }
  }
}

export async function getWorkerJobDetail(jobId: string): Promise<ActionResult<WorkerJobDetail>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('company_id', companyId)
      .single()

    if (jobError || !job) {
      return { success: false, error: jobError?.message ?? 'Job not found' }
    }

    const [addrResult, svcResult] = await Promise.all([
      supabase.from('addresses').select('street, unit, city, state, zip').eq('id', job.address_id).single(),
      supabase.from('service_types').select('name, description, checklist_items, estimated_duration_minutes').eq('id', job.service_type_id).single(),
    ])

    const addr = addrResult.data
    const svc = svcResult.data

    return {
      success: true,
      data: {
        id: job.id,
        street: addr?.street ?? 'Unknown',
        unit: addr?.unit ?? null,
        city: addr?.city ?? '',
        state: addr?.state ?? '',
        zip: addr?.zip ?? '',
        serviceName: svc?.name ?? 'Unknown',
        serviceDescription: svc?.description ?? null,
        checklistItems: svc?.checklist_items ?? [],
        checklistResults: job.checklist_results,
        status: job.status as JobStatus,
        scheduledDate: job.scheduled_date,
        scheduledTime: job.scheduled_time,
        price: job.price,
        tipAmount: job.tip_amount,
        startedAt: job.started_at,
        endedAt: job.ended_at,
        estimatedDuration: svc?.estimated_duration_minutes ?? null,
        driveStartedAt: job.drive_started_at,
        arrivedAt: job.arrived_at,
      },
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch job detail' }
  }
}

export async function updateWorkerJobStatus(
  jobId: string,
  newStatus: string,
  extras?: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const update: Record<string, unknown> = { status: newStatus }

    if (newStatus === 'driving') {
      update.drive_started_at = new Date().toISOString()
    } else if (newStatus === 'arrived') {
      update.arrived_at = new Date().toISOString()
    } else if (newStatus === 'in_progress') {
      update.started_at = new Date().toISOString()
    } else if (newStatus === 'completed') {
      update.ended_at = new Date().toISOString()
    }

    if (extras) {
      Object.assign(update, extras)
    }

    const { error } = await supabase
      .from('jobs')
      .update(update)
      .eq('id', jobId)
      .eq('company_id', companyId)

    if (error) {
      return { success: false, error: `Failed to update job status: ${error.message}` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update job status' }
  }
}

export async function getWorkerCompletedJobs(): Promise<ActionResult<CompletedJobRow[]>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()
    const worker = await getWorkerMember()

    if (!worker) {
      return { success: true, data: [] }
    }

    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, address_id, service_type_id, status, scheduled_date, scheduled_time, price, tip_amount, started_at, ended_at')
      .eq('company_id', companyId)
      .eq('assigned_worker_id', worker.memberId)
      .in('status', ['completed', 'charged'])
      .order('ended_at', { ascending: false })

    if (jobsError) {
      return { success: false, error: jobsError.message }
    }

    if (!jobs || jobs.length === 0) {
      return { success: true, data: [] }
    }

    // Get enriched rows first
    const enriched = await enrichJobRows(supabase, jobs)
    if (!enriched.success || !enriched.data) {
      return { success: false, error: enriched.error }
    }

    // Get ratings for these jobs
    const jobIds = jobs.map(j => j.id)
    const { data: ratings } = await supabase
      .from('job_ratings')
      .select('job_id, rating, review')
      .in('job_id', jobIds)

    const ratingMap = new Map(
      (ratings ?? []).map(r => [r.job_id, { rating: r.rating, review: r.review ?? null }])
    )

    const rows: CompletedJobRow[] = enriched.data.map(job => {
      const ratingInfo = ratingMap.get(job.id)
      return {
        ...job,
        rating: ratingInfo?.rating ?? null,
        review: ratingInfo?.review ?? null,
      }
    })

    return { success: true, data: rows }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch completed jobs' }
  }
}

export async function getWorkerProfileStats(): Promise<ActionResult<WorkerProfileStats>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()
    const worker = await getWorkerMember()

    if (!worker) {
      return { success: true, data: { totalJobs: 0, avgRating: null, totalEarned: 0 } }
    }

    // Count completed jobs
    const { count: totalJobs } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('assigned_worker_id', worker.memberId)
      .in('status', ['completed', 'charged'])

    // Get average rating
    const { data: jobIds } = await supabase
      .from('jobs')
      .select('id')
      .eq('company_id', companyId)
      .eq('assigned_worker_id', worker.memberId)

    let avgRating: number | null = null
    if (jobIds && jobIds.length > 0) {
      const ids = jobIds.map(j => j.id)
      const { data: ratings } = await supabase
        .from('job_ratings')
        .select('rating')
        .in('job_id', ids)

      if (ratings && ratings.length > 0) {
        const sum = ratings.reduce((s, r) => s + r.rating, 0)
        avgRating = sum / ratings.length
      }
    }

    // Total earned from payouts
    const { data: payouts } = await supabase
      .from('worker_payouts')
      .select('amount')
      .eq('worker_id', worker.memberId)
      .eq('status', 'paid')

    const totalEarned = (payouts ?? []).reduce((s, p) => s + p.amount, 0)

    return {
      success: true,
      data: {
        totalJobs: totalJobs ?? 0,
        avgRating,
        totalEarned,
      },
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch profile stats' }
  }
}

export async function updateWorkerProfile(
  userId: string,
  data: { full_name?: string; phone?: string }
): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()

    const update: Record<string, unknown> = {}
    if (data.full_name !== undefined) update.full_name = data.full_name.trim()
    if (data.phone !== undefined) update.phone = data.phone.trim() || null

    if (Object.keys(update).length === 0) return { success: true }

    const { error } = await supabase
      .from('users')
      .update(update)
      .eq('id', userId)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update profile' }
  }
}

// -- Shared helper --

async function enrichJobRows(
  supabase: ReturnType<typeof createAdminClient>,
  jobs: Array<{
    id: string
    address_id: string
    service_type_id: string
    status: string
    scheduled_date: string
    scheduled_time: string | null
    price: number
    tip_amount: number
    started_at: string | null
    ended_at: string | null
  }>
): Promise<ActionResult<WorkerJobRow[]>> {
  const addressIds = [...new Set(jobs.map(j => j.address_id))]
  const serviceIds = [...new Set(jobs.map(j => j.service_type_id))]

  const [addrResult, svcResult] = await Promise.all([
    supabase.from('addresses').select('id, street, city, state, zip').in('id', addressIds),
    supabase.from('service_types').select('id, name, estimated_duration_minutes').in('id', serviceIds),
  ])

  const addrMap = new Map(
    (addrResult.data ?? []).map(a => [a.id, { street: a.street, city: a.city, state: a.state, zip: a.zip }])
  )
  const svcMap = new Map(
    (svcResult.data ?? []).map(s => [s.id, { name: s.name, estimatedDuration: s.estimated_duration_minutes }])
  )

  const rows: WorkerJobRow[] = jobs.map(job => {
    const addr = addrMap.get(job.address_id)
    const svc = svcMap.get(job.service_type_id)
    return {
      id: job.id,
      street: addr?.street ?? 'Unknown',
      city: addr?.city ?? '',
      state: addr?.state ?? '',
      zip: addr?.zip ?? '',
      serviceName: svc?.name ?? 'Unknown',
      status: job.status as JobStatus,
      scheduledDate: job.scheduled_date,
      scheduledTime: job.scheduled_time,
      price: job.price,
      tipAmount: job.tip_amount,
      startedAt: job.started_at,
      endedAt: job.ended_at,
      estimatedDuration: svc?.estimatedDuration ?? null,
    }
  })

  return { success: true, data: rows }
}
