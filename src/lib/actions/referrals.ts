'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getOwnerId } from '@/lib/actions/bootstrap'
import type { ActionResult } from '@/lib/actions/jobs'
import type { ReferralStatus, RewardType } from '@/types/database'

export type ReferralRow = {
  id: string
  referral_code: string
  referral_link: string
  referred_type: string
  referred_user_email: string | null
  status: ReferralStatus
  reward_type: RewardType | null
  reward_value: number | null
  total_earned: number
  created_at: string
}

export async function getReferrals(): Promise<ActionResult<ReferralRow[]>> {
  try {
    const ownerId = await getOwnerId()
    const supabase = createAdminClient()

    const { data: referrals, error } = await supabase
      .from('referrals')
      .select('id, referral_code, referral_link, referred_type, referred_user_id, status, reward_type, reward_value, total_earned, created_at')
      .eq('referrer_user_id', ownerId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get referred user emails
    const referredUserIds = (referrals ?? []).map(r => r.referred_user_id).filter(Boolean) as string[]
    const { data: users } = referredUserIds.length > 0
      ? await supabase.from('users').select('id, email').in('id', referredUserIds)
      : { data: [] }

    const emailMap = new Map(users?.map(u => [u.id, u.email]) ?? [])

    const rows: ReferralRow[] = (referrals ?? []).map(r => ({
      id: r.id,
      referral_code: r.referral_code,
      referral_link: r.referral_link,
      referred_type: r.referred_type,
      referred_user_email: r.referred_user_id ? (emailMap.get(r.referred_user_id) ?? null) : null,
      status: r.status,
      reward_type: r.reward_type,
      reward_value: r.reward_value,
      total_earned: r.total_earned,
      created_at: r.created_at,
    }))

    return { success: true, data: rows }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load referrals' }
  }
}

export async function createReferral(fields: {
  referred_email: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    const ownerId = await getOwnerId()
    const supabase = createAdminClient()

    // Get company_id
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('id', ownerId)
      .single()

    if (!user) throw new Error('User not found')

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', ownerId)
      .limit(1)
      .single()

    if (!company) throw new Error('Company not found')

    // Generate referral code
    const code = 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase()

    const { data, error } = await supabase
      .from('referrals')
      .insert({
        company_id: company.id,
        referrer_user_id: ownerId,
        referral_code: code,
        referral_link: `https://kleanhq.com/r/${code}`,
        referred_type: 'company',
        referred_email: fields.referred_email.trim(),
        status: 'pending',
        reward_value: 0,
        total_earned: 0,
      })
      .select('id')
      .single()

    if (error) throw error
    return { success: true, data: { id: data.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create referral' }
  }
}
