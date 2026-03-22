'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanyId } from '@/lib/actions/bootstrap'

export type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export type DashboardStats = {
  jobsToday: number
  revenueMTD: number
  pendingReviews: number
  activeWorkers: number
}

export type RecentJob = {
  id: string
  address_street: string
  address_city: string
  service_name: string
  worker_name: string | null
  status: string
  scheduled_date: string
  scheduled_time: string | null
  price: number | null
}

export type ActivityEntry = {
  id: string
  action: string
  entity_type: string
  details: Record<string, unknown> | null
  created_at: string
}

export async function getDashboardStats(): Promise<ActionResult<DashboardStats>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const today = new Date().toISOString().split('T')[0]
    const monthStart = `${today.slice(0, 7)}-01`

    const [jobsTodayResult, revenueResult, pendingResult, workersResult] = await Promise.all([
      // Jobs today
      supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('scheduled_date', today),

      // Revenue MTD — sum of paid invoices this month
      supabase
        .from('invoices')
        .select('total')
        .eq('company_id', companyId)
        .eq('status', 'paid')
        .gte('paid_at', `${monthStart}T00:00:00`),

      // Pending reviews
      supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'pending_review'),

      // Active workers
      supabase
        .from('company_members')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'active')
        .eq('role', 'worker'),
    ])

    const revenueMTD = (revenueResult.data ?? []).reduce(
      (sum, inv) => sum + (Number(inv.total) || 0),
      0
    )

    return {
      success: true,
      data: {
        jobsToday: jobsTodayResult.count ?? 0,
        revenueMTD,
        pendingReviews: pendingResult.count ?? 0,
        activeWorkers: workersResult.count ?? 0,
      },
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch dashboard stats' }
  }
}

export async function getRecentJobs(): Promise<ActionResult<RecentJob[]>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const today = new Date().toISOString().split('T')[0]

    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, address_id, service_type_id, assigned_worker_id, status, scheduled_date, scheduled_time, price')
      .eq('company_id', companyId)
      .eq('scheduled_date', today)
      .order('scheduled_time', { ascending: true })
      .limit(5)

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
      supabase.from('addresses').select('id, street, city').in('id', addressIds),
      supabase.from('service_types').select('id, name').in('id', serviceIds),
      workerIds.length > 0
        ? supabase.from('company_members').select('id, user_id').in('id', workerIds)
        : Promise.resolve({ data: [], error: null }),
    ])

    const addressMap = new Map(
      (addressResult.data ?? []).map(a => [a.id, { street: a.street, city: a.city }])
    )
    const serviceMap = new Map(
      (serviceResult.data ?? []).map(s => [s.id, s.name])
    )

    // Resolve worker names
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

    const rows: RecentJob[] = jobs.map(job => {
      const addr = addressMap.get(job.address_id)
      return {
        id: job.id,
        address_street: addr?.street ?? 'Unknown',
        address_city: addr?.city ?? '',
        service_name: serviceMap.get(job.service_type_id) ?? 'Unknown',
        worker_name: job.assigned_worker_id ? (memberNameMap.get(job.assigned_worker_id) ?? null) : null,
        status: job.status,
        scheduled_date: job.scheduled_date,
        scheduled_time: job.scheduled_time,
        price: job.price ?? null,
      }
    })

    return { success: true, data: rows }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch recent jobs' }
  }
}

export type WeeklyRevenuePoint = {
  day: string
  label: string
  revenue: number
}

export type JobStatusCount = {
  status: string
  count: number
}

export async function getWeeklyRevenue(): Promise<ActionResult<WeeklyRevenuePoint[]>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const now = new Date()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(now.getDate() - 6)
    const startDate = sevenDaysAgo.toISOString().split('T')[0]

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('total, paid_at')
      .eq('company_id', companyId)
      .eq('status', 'paid')
      .gte('paid_at', `${startDate}T00:00:00`)

    if (error) throw error

    // Build a map of day -> revenue
    const dayMap = new Map<string, number>()
    for (const inv of invoices ?? []) {
      if (!inv.paid_at) continue
      const day = inv.paid_at.split('T')[0]
      dayMap.set(day, (dayMap.get(day) ?? 0) + (Number(inv.total) || 0))
    }

    // Generate all 7 days
    const points: WeeklyRevenuePoint[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo)
      d.setDate(sevenDaysAgo.getDate() + i)
      const key = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('en-US', { weekday: 'short' })
      points.push({ day: key, label, revenue: dayMap.get(key) ?? 0 })
    }

    return { success: true, data: points }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch weekly revenue' }
  }
}

export async function getJobStatusCounts(): Promise<ActionResult<JobStatusCount[]>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('status')
      .eq('company_id', companyId)

    if (error) throw error

    const countMap = new Map<string, number>()
    for (const job of jobs ?? []) {
      countMap.set(job.status, (countMap.get(job.status) ?? 0) + 1)
    }

    const counts: JobStatusCount[] = [...countMap.entries()]
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count)

    return { success: true, data: counts }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch job status counts' }
  }
}

export async function getRecentActivity(): Promise<ActionResult<ActivityEntry[]>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('activity_logs')
      .select('id, action, entity_type, details, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      // Table might not exist or have data yet — return empty
      return { success: true, data: [] }
    }

    return { success: true, data: data ?? [] }
  } catch {
    // Gracefully handle missing table
    return { success: true, data: [] }
  }
}
