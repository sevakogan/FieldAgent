'use server'

import { createAdminClient } from '@/lib/supabase/admin'

// ── Types ──────────────────────────────────────────────────────────────

interface Reseller {
  id: string
  brand_name: string
  margin_percentage: number
}

interface OverviewCompany {
  id: string
  name: string
  status: string
  created_at: string
}

interface OverviewStats {
  companiesCount: number
  totalRevenue: number
  marginEarnings: number
  pendingInvoices: number
}

interface ResellerCompaniesData {
  companies: {
    id: string
    name: string
    slug: string
    status: string
    created_at: string
  }[]
  marginPercentage: number
}

interface MonthlyRevenue {
  month: string
  invoiceTotal: number
  marginEarning: number
  invoiceCount: number
}

interface RevenueData {
  marginPercentage: number
  monthlyBreakdown: MonthlyRevenue[]
  totalEarned: number
  currentMonthEarning: number
  pendingPayout: number
}

interface ReferralsData {
  referrals: {
    id: string
    referred_email: string
    referral_code: string
    status: string
    reward_value: number
    created_at: string
  }[]
  resellerSlug: string
}

interface PromoCode {
  id: string
  code: string
  discount_type: string
  discount_value: number
  max_uses: number | null
  current_uses: number
  status: string
  created_at: string
}

interface ResellerSettings {
  id: string
  brand_name: string
  brand_color: string
  custom_domain: string
  margin_percentage: number
  slug: string
  logo_url: string
  whitelabel_badge: boolean
  status: string
}

// ── Overview Page ──────────────────────────────────────────────────────

export async function fetchResellerOverview(): Promise<{
  reseller: Reseller | null
  companies: OverviewCompany[]
  stats: OverviewStats
}> {
  const supabase = createAdminClient()

  const { data: reseller } = await supabase
    .from("resellers")
    .select("id, brand_name, margin_percentage")
    .limit(1)
    .single()

  if (!reseller) {
    return {
      reseller: null,
      companies: [],
      stats: { companiesCount: 0, totalRevenue: 0, marginEarnings: 0, pendingInvoices: 0 },
    }
  }

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, status, created_at")
    .eq("reseller_id", reseller.id)
    .order("created_at", { ascending: false })

  const companyList = companies ?? []
  const companyIds = companyList.map((c) => c.id)

  let totalRevenue = 0
  let pendingInvoices = 0

  if (companyIds.length > 0) {
    const { data: invoices } = await supabase
      .from("invoices")
      .select("total, status")
      .in("company_id", companyIds)

    const invoiceList = invoices ?? []
    totalRevenue = invoiceList
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + (inv.total ?? 0), 0)
    pendingInvoices = invoiceList
      .filter((inv) => inv.status === "pending")
      .reduce((sum, inv) => sum + (inv.total ?? 0), 0)
  }

  const marginEarnings = totalRevenue * ((reseller.margin_percentage ?? 0) / 100)

  return {
    reseller,
    companies: companyList.slice(0, 5),
    stats: {
      companiesCount: companyList.length,
      totalRevenue,
      marginEarnings,
      pendingInvoices,
    },
  }
}

// ── Companies Page ─────────────────────────────────────────────────────

export async function fetchResellerCompanies(): Promise<ResellerCompaniesData | null> {
  const supabase = createAdminClient()

  const { data: reseller } = await supabase
    .from("resellers")
    .select("id, margin_percentage")
    .limit(1)
    .single()

  if (!reseller) return null

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, slug, status, created_at")
    .eq("reseller_id", reseller.id)
    .order("created_at", { ascending: false })

  return {
    companies: companies ?? [],
    marginPercentage: reseller.margin_percentage ?? 0,
  }
}

// ── Revenue Page ───────────────────────────────────────────────────────

export async function fetchResellerRevenue(): Promise<RevenueData | null> {
  const supabase = createAdminClient()

  const { data: reseller } = await supabase
    .from("resellers")
    .select("id, margin_percentage")
    .limit(1)
    .single()

  if (!reseller) return null

  const { data: companies } = await supabase
    .from("companies")
    .select("id")
    .eq("reseller_id", reseller.id)

  const companyIds = (companies ?? []).map((c) => c.id)

  if (companyIds.length === 0) {
    return {
      marginPercentage: reseller.margin_percentage ?? 0,
      monthlyBreakdown: [],
      totalEarned: 0,
      currentMonthEarning: 0,
      pendingPayout: 0,
    }
  }

  const { data: invoices } = await supabase
    .from("invoices")
    .select("total, status, paid_at, created_at")
    .in("company_id", companyIds)
    .order("created_at", { ascending: false })

  const invoiceList = invoices ?? []
  const margin = reseller.margin_percentage ?? 0

  // Group by month
  const monthMap = new Map<string, { total: number; count: number }>()
  for (const inv of invoiceList) {
    if (inv.status !== "paid") continue
    const date = new Date(inv.paid_at ?? inv.created_at)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const existing = monthMap.get(key) ?? { total: 0, count: 0 }
    monthMap.set(key, {
      total: existing.total + (inv.total ?? 0),
      count: existing.count + 1,
    })
  }

  const monthlyBreakdown: MonthlyRevenue[] = Array.from(monthMap.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, val]) => {
      const [year, month] = key.split("-")
      const date = new Date(Number(year), Number(month) - 1)
      return {
        month: date.toLocaleDateString("en-US", { year: "numeric", month: "long" }),
        invoiceTotal: val.total,
        marginEarning: val.total * (margin / 100),
        invoiceCount: val.count,
      }
    })

  const totalPaid = invoiceList
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + (inv.total ?? 0), 0)

  const pendingPayout = invoiceList
    .filter((inv) => inv.status === "pending")
    .reduce((sum, inv) => sum + (inv.total ?? 0), 0)

  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const currentMonthData = monthMap.get(currentMonthKey)
  const currentMonthEarning = (currentMonthData?.total ?? 0) * (margin / 100)

  return {
    marginPercentage: margin,
    monthlyBreakdown,
    totalEarned: totalPaid * (margin / 100),
    currentMonthEarning,
    pendingPayout: pendingPayout * (margin / 100),
  }
}

// ── Referrals Page ─────────────────────────────────────────────────────

export async function fetchResellerReferrals(): Promise<ReferralsData | null> {
  const supabase = createAdminClient()

  const { data: reseller } = await supabase
    .from("resellers")
    .select("id, slug")
    .limit(1)
    .single()

  if (!reseller) return null

  const { data: referrals } = await supabase
    .from("referrals")
    .select("id, referred_email, referral_code, status, reward_value, created_at")
    .eq("referrer_id", reseller.id)
    .order("created_at", { ascending: false })

  return {
    referrals: referrals ?? [],
    resellerSlug: reseller.slug ?? "",
  }
}

// ── Promo Codes Page ───────────────────────────────────────────────────

export async function fetchPromoCodes(): Promise<PromoCode[] | null> {
  const supabase = createAdminClient()

  const { data: reseller } = await supabase
    .from("resellers")
    .select("id")
    .limit(1)
    .single()

  if (!reseller) return null

  const { data: codes } = await supabase
    .from("promo_codes")
    .select("id, code, discount_type, discount_value, max_uses, current_uses, status, created_at")
    .eq("level", "reseller")
    .order("created_at", { ascending: false })

  return codes ?? []
}

export async function createPromoCode(formData: {
  code: string
  discountType: string
  discountValue: number
  maxUses: number
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { data: reseller } = await supabase
    .from("resellers")
    .select("id")
    .limit(1)
    .single()

  if (!reseller) return { success: false, error: "No reseller found" }

  const { error } = await supabase.from("promo_codes").insert({
    code: formData.code.toUpperCase(),
    level: "reseller",
    discount_type: formData.discountType,
    discount_value: formData.discountValue,
    max_uses: formData.maxUses || null,
    current_uses: 0,
    status: "active",
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ── Settings Page ──────────────────────────────────────────────────────

export async function fetchResellerSettings(): Promise<ResellerSettings | null> {
  const supabase = createAdminClient()

  const { data: reseller } = await supabase
    .from("resellers")
    .select("id, brand_name, brand_color, custom_domain, margin_percentage, slug, logo_url, whitelabel_badge, status")
    .limit(1)
    .single()

  return reseller ?? null
}

export async function updateResellerSettings(
  id: string,
  updates: {
    brand_name: string
    brand_color: string
    custom_domain: string
    margin_percentage: number
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from("resellers")
    .update({
      brand_name: updates.brand_name,
      brand_color: updates.brand_color,
      custom_domain: updates.custom_domain,
      margin_percentage: updates.margin_percentage,
    })
    .eq("id", id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ── Invite Company as Reseller ────────────────────────────────────────

export async function inviteCompanyAsReseller(fields: {
  companyName: string
  ownerEmail: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  // Get reseller
  const { data: reseller } = await supabase
    .from("resellers")
    .select("id")
    .limit(1)
    .single()

  if (!reseller) return { success: false, error: "No reseller account found" }

  // Check if user already exists
  const { data: existingUsers } = await supabase
    .from("users")
    .select("id")
    .eq("email", fields.ownerEmail.trim())
    .limit(1)

  let userId: string

  if (existingUsers && existingUsers.length > 0) {
    userId = existingUsers[0].id
  } else {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: fields.ownerEmail.trim(),
      email_confirm: true,
    })
    if (authError) return { success: false, error: authError.message }

    userId = authData.user.id

    // Create users record
    const { error: userError } = await supabase
      .from("users")
      .insert({ id: userId, email: fields.ownerEmail.trim(), role: "owner" })
    if (userError) return { success: false, error: userError.message }
  }

  // Create company with reseller_id
  const slug = fields.companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  const { error: companyError } = await supabase
    .from("companies")
    .insert({
      name: fields.companyName.trim(),
      slug,
      owner_id: userId,
      reseller_id: reseller.id,
      status: "active",
      business_type: "cleaning",
    })

  if (companyError) return { success: false, error: companyError.message }
  return { success: true }
}
