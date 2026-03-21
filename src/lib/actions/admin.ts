'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/lib/actions/jobs'

// ─── Overview ────────────────────────────────────────────────────────
export async function getAdminOverview(): Promise<ActionResult<{
  totalCompanies: number
  mrr: number
  totalRevenue: number
  recentSignups: Array<{ id: string; name: string; status: string; created_at: string }>
  recentActivity: Array<{ id: string; action: string; entity_type: string; entity_id: string; created_at: string }>
}>> {
  try {
    const supabase = createAdminClient()

    const [companiesRes, invoicesPaidRes, recentRes, activityRes] = await Promise.all([
      supabase.from('companies').select('id', { count: 'exact', head: true }),
      supabase.from('invoices').select('total').eq('status', 'paid'),
      supabase.from('companies').select('id, name, status, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('activity_log').select('id, action, entity_type, entity_id, created_at').order('created_at', { ascending: false }).limit(5),
    ])

    const totalCompanies = companiesRes.count ?? 0
    const totalRevenue = (invoicesPaidRes.data ?? []).reduce((sum, inv) => sum + (inv.total ?? 0), 0)

    // MRR: sum of most recent month's paid invoices
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const mrrRes = await supabase
      .from('invoices')
      .select('total')
      .eq('status', 'paid')
      .gte('created_at', startOfMonth)

    const mrr = (mrrRes.data ?? []).reduce((sum, inv) => sum + (inv.total ?? 0), 0)

    return {
      success: true,
      data: {
        totalCompanies,
        mrr,
        totalRevenue,
        recentSignups: recentRes.data ?? [],
        recentActivity: activityRes.data ?? [],
      },
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load overview' }
  }
}

// ─── Companies ───────────────────────────────────────────────────────
export async function getAdminCompanies(): Promise<ActionResult<Array<{
  id: string
  name: string
  business_type: string | null
  status: string
  created_at: string
  owner_id: string | null
  owner_name: string | null
  owner_email: string | null
}>>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, business_type, status, created_at, owner_id, users!companies_owner_id_fkey(full_name, email)')
      .order('created_at', { ascending: false })

    if (error) throw error

    const mapped = (data ?? []).map((c: Record<string, unknown>) => {
      const user = c.users as { full_name: string | null; email: string | null } | null
      return {
        id: c.id as string,
        name: c.name as string,
        business_type: c.business_type as string | null,
        status: c.status as string,
        created_at: c.created_at as string,
        owner_id: c.owner_id as string | null,
        owner_name: user?.full_name ?? null,
        owner_email: user?.email ?? null,
      }
    })

    return { success: true, data: mapped }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load companies' }
  }
}

// ─── Resellers ───────────────────────────────────────────────────────
export async function getAdminResellers(): Promise<ActionResult<Array<{
  id: string
  brand_name: string | null
  slug: string | null
  margin_percentage: number | null
  status: string
  properties_count: number | null
  created_at: string
  user_name: string | null
  user_email: string | null
}>>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('resellers')
      .select('id, brand_name, slug, margin_percentage, status, properties_count, created_at, users!resellers_user_id_fkey(full_name, email)')
      .order('created_at', { ascending: false })

    if (error) throw error

    const mapped = (data ?? []).map((r: Record<string, unknown>) => {
      const user = r.users as { full_name: string | null; email: string | null } | null
      return {
        id: r.id as string,
        brand_name: r.brand_name as string | null,
        slug: r.slug as string | null,
        margin_percentage: r.margin_percentage as number | null,
        status: r.status as string,
        properties_count: r.properties_count as number | null,
        created_at: r.created_at as string,
        user_name: user?.full_name ?? null,
        user_email: user?.email ?? null,
      }
    })

    return { success: true, data: mapped }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load resellers' }
  }
}

// ─── Billing / Invoices ──────────────────────────────────────────────
export async function getAdminBilling(): Promise<ActionResult<{
  mrr: number
  totalCollected: number
  outstanding: number
  overdueCount: number
  invoices: Array<{
    id: string
    total: number
    status: string
    created_at: string
    company_name: string | null
  }>
}>> {
  try {
    const supabase = createAdminClient()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [mrrRes, allPaidRes, outstandingRes, invoicesRes] = await Promise.all([
      supabase.from('invoices').select('total').eq('status', 'paid').gte('created_at', startOfMonth),
      supabase.from('invoices').select('total').eq('status', 'paid'),
      supabase.from('invoices').select('total, status').in('status', ['pending', 'overdue']),
      supabase
        .from('invoices')
        .select('id, total, status, created_at, companies!invoices_company_id_fkey(name)')
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    const mrr = (mrrRes.data ?? []).reduce((sum, i) => sum + (i.total ?? 0), 0)
    const totalCollected = (allPaidRes.data ?? []).reduce((sum, i) => sum + (i.total ?? 0), 0)
    const outstanding = (outstandingRes.data ?? []).reduce((sum, i) => sum + (i.total ?? 0), 0)
    const overdueCount = (outstandingRes.data ?? []).filter(i => i.status === 'overdue').length

    const invoices = (invoicesRes.data ?? []).map((inv: Record<string, unknown>) => {
      const company = inv.companies as { name: string } | null
      return {
        id: inv.id as string,
        total: inv.total as number,
        status: inv.status as string,
        created_at: inv.created_at as string,
        company_name: company?.name ?? null,
      }
    })

    return { success: true, data: { mrr, totalCollected, outstanding, overdueCount, invoices } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load billing' }
  }
}

// ─── Revenue ─────────────────────────────────────────────────────────
export async function getAdminRevenue(): Promise<ActionResult<{
  invoices: Array<{ total: number; status: string; created_at: string }>
}>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('invoices')
      .select('total, status, created_at')
      .order('created_at', { ascending: true })

    if (error) throw error
    return { success: true, data: { invoices: data ?? [] } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load revenue' }
  }
}

// ─── Referrals ───────────────────────────────────────────────────────
export async function getAdminReferrals(): Promise<ActionResult<Array<{
  id: string
  referrer_type: string | null
  referred_email: string | null
  referral_code: string | null
  status: string
  reward_type: string | null
  reward_value: number | null
  created_at: string
  company_name: string | null
}>>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('referrals')
      .select('id, referrer_type, referred_email, referral_code, status, reward_type, reward_value, created_at, companies!referrals_company_id_fkey(name)')
      .order('created_at', { ascending: false })

    if (error) throw error

    const mapped = (data ?? []).map((r: Record<string, unknown>) => {
      const company = r.companies as { name: string } | null
      return {
        id: r.id as string,
        referrer_type: r.referrer_type as string | null,
        referred_email: r.referred_email as string | null,
        referral_code: r.referral_code as string | null,
        status: r.status as string,
        reward_type: r.reward_type as string | null,
        reward_value: r.reward_value as number | null,
        created_at: r.created_at as string,
        company_name: company?.name ?? null,
      }
    })

    return { success: true, data: mapped }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load referrals' }
  }
}

// ─── Waitlist ────────────────────────────────────────────────────────
export async function getAdminWaitlist(): Promise<ActionResult<Array<Record<string, unknown>>>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('waitlist_entries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // Table might not exist
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return { success: true, data: [] }
      }
      throw error
    }

    return { success: true, data: data ?? [] }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load waitlist' }
  }
}

// ─── Promo Codes ─────────────────────────────────────────────────────
export async function getAdminPromoCodes(): Promise<ActionResult<Array<{
  id: string
  code: string
  level: string | null
  discount_type: string | null
  discount_value: number | null
  max_uses: number | null
  current_uses: number | null
  expires_at: string | null
  status: string
  created_at: string
}>>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('promo_codes')
      .select('id, code, level, discount_type, discount_value, max_uses, current_uses, expires_at, status, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data: data ?? [] }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load promo codes' }
  }
}

export async function createPromoCode(fields: {
  code: string
  discount_type: string
  discount_value: number
  max_uses: number
  expires_at: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('promo_codes')
      .insert({
        code: fields.code.toUpperCase(),
        level: 'platform',
        discount_type: fields.discount_type,
        discount_value: fields.discount_value,
        max_uses: fields.max_uses,
        expires_at: fields.expires_at,
        status: 'active',
        current_uses: 0,
      })
      .select('id')
      .single()

    if (error) throw error
    return { success: true, data: { id: data.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create promo code' }
  }
}

export async function updatePromoCodeStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('promo_codes')
      .update({ status })
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update promo code' }
  }
}

// ─── Webhooks ────────────────────────────────────────────────────────
export async function getAdminWebhooks(): Promise<ActionResult<Array<{
  id: string
  source: string | null
  event_type: string | null
  status: string
  processed_at: string | null
  created_at: string
}>>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('id, source, event_type, status, processed_at, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return { success: true, data: data ?? [] }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load webhooks' }
  }
}

// ─── Analytics ───────────────────────────────────────────────────────
export async function getAdminAnalytics(): Promise<ActionResult<{
  totalUsers: number
  totalCompanies: number
  companies: Array<{ id: string; name: string; created_at: string }>
}>> {
  try {
    const supabase = createAdminClient()

    const [usersRes, companiesCountRes, companiesRes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('companies').select('id', { count: 'exact', head: true }),
      supabase.from('companies').select('id, name, created_at').order('created_at', { ascending: true }),
    ])

    return {
      success: true,
      data: {
        totalUsers: usersRes.count ?? 0,
        totalCompanies: companiesCountRes.count ?? 0,
        companies: companiesRes.data ?? [],
      },
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load analytics' }
  }
}

// ─── Feedback ────────────────────────────────────────────────────────
export async function getAdminFeedback(): Promise<ActionResult<Array<{
  id: string
  type: string | null
  title: string | null
  description: string | null
  status: string
  votes: number | null
  created_at: string
  user_name: string | null
  user_email: string | null
}>>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('feedback')
      .select('id, type, title, description, status, votes, created_at, users!feedback_user_id_fkey(full_name, email)')
      .order('created_at', { ascending: false })

    if (error) throw error

    const mapped = (data ?? []).map((f: Record<string, unknown>) => {
      const user = f.users as { full_name: string | null; email: string | null } | null
      return {
        id: f.id as string,
        type: f.type as string | null,
        title: f.title as string | null,
        description: f.description as string | null,
        status: f.status as string,
        votes: f.votes as number | null,
        created_at: f.created_at as string,
        user_name: user?.full_name ?? null,
        user_email: user?.email ?? null,
      }
    })

    return { success: true, data: mapped }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load feedback' }
  }
}

// ─── Help Articles ───────────────────────────────────────────────────
export async function getAdminHelpArticles(): Promise<ActionResult<Array<{
  id: string
  title: string
  category: string | null
  content: string | null
  views: number | null
  helpful_count: number | null
  status: string
  created_at: string
}>>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('help_articles')
      .select('id, title, category, content, views, helpful_count, status, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data: data ?? [] }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load help articles' }
  }
}

// ─── Platform Settings ───────────────────────────────────────────────
export async function getAdminSettings(): Promise<ActionResult<Array<{
  key: string
  value: string | null
  description: string | null
}>>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('platform_settings')
      .select('key, value, description')
      .order('key', { ascending: true })

    if (error) throw error
    return { success: true, data: data ?? [] }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load settings' }
  }
}

export async function updateAdminSetting(key: string, value: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('platform_settings')
      .upsert({ key, value }, { onConflict: 'key' })

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update setting' }
  }
}

// ─── Reseller Mutations ─────────────────────────────────────────────
export async function createAdminReseller(fields: {
  brand_name: string
  user_email: string
  margin_percentage: number
  slug: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createAdminClient()

    // Check if user already exists by email
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .eq('email', fields.user_email)
      .limit(1)

    let userId: string

    if (existingUsers && existingUsers.length > 0) {
      userId = existingUsers[0].id
    } else {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: fields.user_email,
        email_confirm: true,
      })
      if (authError) throw authError

      userId = authData.user.id

      // Create users record
      const { error: userError } = await supabase
        .from('users')
        .insert({ id: userId, email: fields.user_email, role: 'reseller' })
      if (userError) throw userError
    }

    // Create resellers record
    const { data, error } = await supabase
      .from('resellers')
      .insert({
        user_id: userId,
        brand_name: fields.brand_name,
        slug: fields.slug,
        margin_percentage: fields.margin_percentage,
        status: 'active',
      })
      .select('id')
      .single()

    if (error) throw error
    return { success: true, data: { id: data.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create reseller' }
  }
}

export async function updateResellerStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('resellers')
      .update({ status })
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update reseller status' }
  }
}

// ─── Company Mutations ──────────────────────────────────────────────
export async function updateCompanyStatus(companyId: string, status: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('companies')
      .update({ status })
      .eq('id', companyId)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update company status' }
  }
}

// ─── Waitlist Mutations ─────────────────────────────────────────────
export async function approveWaitlistEntry(id: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('waitlist_entries')
      .update({ status: 'approved' })
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to approve waitlist entry' }
  }
}

export async function rejectWaitlistEntry(id: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('waitlist_entries')
      .update({ status: 'rejected' })
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to reject waitlist entry' }
  }
}

// ─── Feedback Mutations ─────────────────────────────────────────────
export async function updateFeedbackStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('feedback')
      .update({ status })
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update feedback status' }
  }
}

// ─── Help Article Mutations ─────────────────────────────────────────
export async function createHelpArticle(fields: {
  title: string
  category: string
  content: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('help_articles')
      .insert({
        title: fields.title,
        category: fields.category,
        content: fields.content,
        status: 'published',
        views: 0,
        helpful_count: 0,
      })
      .select('id')
      .single()

    if (error) throw error
    return { success: true, data: { id: data.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create help article' }
  }
}

export async function deleteHelpArticle(id: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('help_articles')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete help article' }
  }
}

// ─── Webhook Mutations ──────────────────────────────────────────────
export async function retryWebhook(id: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('webhook_logs')
      .update({ status: 'received', processed_at: null })
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to retry webhook' }
  }
}

// ─── Referral Status Update ────────────────────────────────────────
export async function updateReferralStatus(
  id: string,
  status: string
): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('referrals')
      .update({ status })
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update referral status' }
  }
}

// ─── Changelog (stored as help_articles with category='changelog') ─
export async function getChangelogEntries(): Promise<ActionResult<Array<{
  id: string
  title: string
  content: string | null
  version: string | null
  entry_type: string | null
  created_at: string
}>>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('help_articles')
      .select('id, title, content, category, status, created_at')
      .eq('category', 'changelog')
      .order('created_at', { ascending: false })

    if (error) {
      // Table might not support this query — return empty
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return { success: true, data: [] }
      }
      throw error
    }

    const mapped = (data ?? []).map((a: Record<string, unknown>) => {
      // Parse version and type from title format: "[version] title" and status as type
      const titleStr = a.title as string
      const versionMatch = titleStr.match(/^\[([^\]]+)\]\s*/)
      return {
        id: a.id as string,
        title: versionMatch ? titleStr.replace(versionMatch[0], '') : titleStr,
        content: a.content as string | null,
        version: versionMatch ? versionMatch[1] : null,
        entry_type: a.status as string | null,
        created_at: a.created_at as string,
      }
    })

    return { success: true, data: mapped }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load changelog' }
  }
}

export async function createChangelogEntry(fields: {
  version: string
  title: string
  description: string
  type: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('help_articles')
      .insert({
        title: `[${fields.version}] ${fields.title}`,
        content: fields.description,
        category: 'changelog',
        status: fields.type,
        views: 0,
        helpful_count: 0,
      })
      .select('id')
      .single()

    if (error) throw error
    return { success: true, data: { id: data.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create changelog entry' }
  }
}

export async function deleteChangelogEntry(id: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('help_articles')
      .delete()
      .eq('id', id)
      .eq('category', 'changelog')

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete changelog entry' }
  }
}
