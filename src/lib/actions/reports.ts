'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanyId } from '@/lib/actions/bootstrap'
import type { ActionResult } from '@/lib/actions/jobs'

export type ReportData = {
  total_jobs: number
  total_revenue: number
  total_clients: number
  avg_rating: number
  jobs_by_status: { status: string; count: number }[]
  top_services: { name: string; count: number; revenue: number }[]
}

export async function getReportData(): Promise<ActionResult<ReportData>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    // Total jobs
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, status, service_type_id, price')
      .eq('company_id', companyId)

    const totalJobs = jobs?.length ?? 0

    // Total revenue (paid invoices)
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total')
      .eq('company_id', companyId)
      .eq('status', 'paid')

    const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total ?? 0), 0) ?? 0

    // Total clients
    const { data: clientCompanies } = await supabase
      .from('client_companies')
      .select('id')
      .eq('company_id', companyId)

    const totalClients = clientCompanies?.length ?? 0

    // Average rating
    const jobIds = jobs?.map(j => j.id) ?? []
    let avgRating = 0
    if (jobIds.length > 0) {
      const { data: ratings } = await supabase
        .from('job_ratings')
        .select('rating')
        .in('job_id', jobIds)

      if (ratings && ratings.length > 0) {
        avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      }
    }

    // Jobs by status
    const statusCounts = new Map<string, number>()
    for (const job of jobs ?? []) {
      statusCounts.set(job.status, (statusCounts.get(job.status) ?? 0) + 1)
    }
    const jobsByStatus = [...statusCounts.entries()]
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count)

    // Top services
    const serviceMap = new Map<string, { count: number; revenue: number }>()
    for (const job of jobs ?? []) {
      const existing = serviceMap.get(job.service_type_id) ?? { count: 0, revenue: 0 }
      serviceMap.set(job.service_type_id, {
        count: existing.count + 1,
        revenue: existing.revenue + (job.price ?? 0),
      })
    }

    const serviceTypeIds = [...serviceMap.keys()]
    let topServices: { name: string; count: number; revenue: number }[] = []

    if (serviceTypeIds.length > 0) {
      const { data: serviceTypes } = await supabase
        .from('service_types')
        .select('id, name')
        .in('id', serviceTypeIds)

      const nameMap = new Map(serviceTypes?.map(s => [s.id, s.name]) ?? [])

      topServices = [...serviceMap.entries()]
        .map(([id, data]) => ({ name: nameMap.get(id) ?? 'Unknown', ...data }))
        .sort((a, b) => b.count - a.count)
    }

    return {
      success: true,
      data: {
        total_jobs: totalJobs,
        total_revenue: totalRevenue,
        total_clients: totalClients,
        avg_rating: avgRating,
        jobs_by_status: jobsByStatus,
        top_services: topServices,
      },
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load report data' }
  }
}
