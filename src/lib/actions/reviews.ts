'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanyId } from '@/lib/actions/bootstrap'
import type { ActionResult } from '@/lib/actions/jobs'

export type ReviewRow = {
  id: string
  job_id: string
  client_name: string
  rating: number
  review: string | null
  response: string | null
  created_at: string
}

export type ReviewStats = {
  total: number
  average: number
  distribution: Record<number, number>
}

export async function getReviews(): Promise<ActionResult<{ reviews: ReviewRow[]; stats: ReviewStats }>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    // Fetch ratings for jobs belonging to this company
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id')
      .eq('company_id', companyId)

    if (!jobs || jobs.length === 0) {
      return {
        success: true,
        data: {
          reviews: [],
          stats: { total: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
        },
      }
    }

    const jobIds = jobs.map(j => j.id)

    const { data: ratings, error } = await supabase
      .from('job_ratings')
      .select('id, job_id, client_id, rating, review, response, created_at')
      .in('job_id', jobIds)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get client names
    const clientIds = [...new Set((ratings ?? []).map(r => r.client_id))]
    const { data: clients } = await supabase
      .from('clients')
      .select('id, user_id')
      .in('id', clientIds)

    const userIds = clients?.map(c => c.user_id) ?? []
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name')
      .in('id', userIds)

    const userMap = new Map(users?.map(u => [u.id, u.full_name]) ?? [])
    const clientUserMap = new Map(clients?.map(c => [c.id, c.user_id]) ?? [])

    const reviews: ReviewRow[] = (ratings ?? []).map(r => ({
      id: r.id,
      job_id: r.job_id,
      client_name: userMap.get(clientUserMap.get(r.client_id) ?? '') ?? 'Unknown Client',
      rating: r.rating,
      review: r.review ?? null,
      response: r.response ?? null,
      created_at: r.created_at,
    }))

    // Calculate stats
    const total = reviews.length
    const average = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    for (const r of reviews) {
      distribution[r.rating] = (distribution[r.rating] ?? 0) + 1
    }

    return { success: true, data: { reviews, stats: { total, average, distribution } } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load reviews' }
  }
}

export async function respondToReview(reviewId: string, response: string): Promise<ActionResult<null>> {
  try {
    if (!reviewId || !response.trim()) {
      return { success: false, error: 'Review ID and response text are required' }
    }

    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    // Verify the review belongs to a job owned by this company
    const { data: rating, error: fetchError } = await supabase
      .from('job_ratings')
      .select('id, job_id')
      .eq('id', reviewId)
      .single()

    if (fetchError || !rating) {
      return { success: false, error: 'Review not found' }
    }

    const { data: job } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', rating.job_id)
      .eq('company_id', companyId)
      .single()

    if (!job) {
      return { success: false, error: 'Unauthorized: review does not belong to your company' }
    }

    const { error: updateError } = await supabase
      .from('job_ratings')
      .update({ response: response.trim() })
      .eq('id', reviewId)

    if (updateError) throw updateError

    return { success: true, data: null }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to save response' }
  }
}
