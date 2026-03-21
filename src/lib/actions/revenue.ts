'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanyId } from '@/lib/actions/bootstrap'
import type { ActionResult } from '@/lib/actions/jobs'

export type MonthlyRevenue = {
  month: string
  total: number
  count: number
}

export type RevenueByService = {
  service_name: string
  total: number
  count: number
}

export type RevenueStats = {
  total_revenue: number
  this_month: number
  last_month: number
  avg_per_job: number
  monthly: MonthlyRevenue[]
  by_service: RevenueByService[]
}

export async function getRevenueData(): Promise<ActionResult<RevenueStats>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    // Get all paid invoices
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('id, total, paid_at, job_id, created_at')
      .eq('company_id', companyId)
      .eq('status', 'paid')
      .order('paid_at', { ascending: false })

    if (error) throw error

    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

    const allInvoices = invoices ?? []
    const totalRevenue = allInvoices.reduce((sum, inv) => sum + (inv.total ?? 0), 0)
    const thisMonthInvoices = allInvoices.filter(inv => (inv.paid_at ?? inv.created_at) >= thisMonthStart)
    const lastMonthInvoices = allInvoices.filter(inv => {
      const d = inv.paid_at ?? inv.created_at
      return d >= lastMonthStart && d <= lastMonthEnd
    })

    const thisMonth = thisMonthInvoices.reduce((sum, inv) => sum + (inv.total ?? 0), 0)
    const lastMonth = lastMonthInvoices.reduce((sum, inv) => sum + (inv.total ?? 0), 0)
    const avgPerJob = allInvoices.length > 0 ? totalRevenue / allInvoices.length : 0

    // Group by month
    const monthMap = new Map<string, { total: number; count: number }>()
    for (const inv of allInvoices) {
      const d = new Date(inv.paid_at ?? inv.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const existing = monthMap.get(key) ?? { total: 0, count: 0 }
      monthMap.set(key, { total: existing.total + (inv.total ?? 0), count: existing.count + 1 })
    }

    const monthly: MonthlyRevenue[] = [...monthMap.entries()]
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => b.month.localeCompare(a.month))

    // Revenue by service — get job service types
    const jobIds = allInvoices.map(inv => inv.job_id).filter(Boolean) as string[]
    let byService: RevenueByService[] = []

    if (jobIds.length > 0) {
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, service_type_id, price')
        .in('id', jobIds)

      if (jobs && jobs.length > 0) {
        const serviceTypeIds = [...new Set(jobs.map(j => j.service_type_id))]
        const { data: serviceTypes } = await supabase
          .from('service_types')
          .select('id, name')
          .in('id', serviceTypeIds)

        const serviceNameMap = new Map(serviceTypes?.map(s => [s.id, s.name]) ?? [])

        // Map invoice totals to services via jobs
        const jobServiceMap = new Map(jobs.map(j => [j.id, j.service_type_id]))
        const serviceRevMap = new Map<string, { total: number; count: number }>()

        for (const inv of allInvoices) {
          if (!inv.job_id) continue
          const serviceId = jobServiceMap.get(inv.job_id)
          if (!serviceId) continue
          const name = serviceNameMap.get(serviceId) ?? 'Unknown Service'
          const existing = serviceRevMap.get(name) ?? { total: 0, count: 0 }
          serviceRevMap.set(name, { total: existing.total + (inv.total ?? 0), count: existing.count + 1 })
        }

        byService = [...serviceRevMap.entries()]
          .map(([service_name, data]) => ({ service_name, ...data }))
          .sort((a, b) => b.total - a.total)
      }
    }

    return {
      success: true,
      data: { total_revenue: totalRevenue, this_month: thisMonth, last_month: lastMonth, avg_per_job: avgPerJob, monthly, by_service: byService },
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load revenue data' }
  }
}
