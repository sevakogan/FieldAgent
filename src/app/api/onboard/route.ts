import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getMergedServices } from '@/lib/service-catalog'
import { sendEmail } from '@/lib/email/send'
import { welcomeEmailHtml } from '@/lib/email/templates/welcome'
import { NextResponse } from 'next/server'

function normalizeBusinessType(raw: unknown): string {
  if (Array.isArray(raw)) return raw.filter(Boolean).join(',')
  return typeof raw === 'string' ? raw : 'lawn_care'
}

function parseBusinessTypes(raw: unknown): readonly string[] {
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (typeof raw === 'string') return raw.split(',').filter(Boolean)
  return ['lawn_care']
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    companyName,
    fullName,
    firstName,
    lastName,
    username,
    phone,
    businessType: rawBusinessType = 'lawn_care',
    sendWelcomeEmail = false,
  } = body

  if (!companyName) {
    return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
  }

  const resolvedFullName = fullName ?? (`${firstName ?? ''} ${lastName ?? ''}`.trim() || 'Owner')
  const businessTypeStr = normalizeBusinessType(rawBusinessType)
  const businessTypes = parseBusinessTypes(rawBusinessType)

  const admin = createAdminClient()

  // Check if user already has a profile with a company
  const { data: existing } = await admin
    .from('profiles')
    .select('id, company_id')
    .eq('id', user.id)
    .single()

  let companyId: string

  if (existing?.company_id) {
    // Already onboarded — update existing records
    const { error: companyError } = await admin
      .from('companies')
      .update({ name: companyName, phone: phone || '', business_type: businessTypeStr })
      .eq('id', existing.company_id)

    if (companyError) {
      return NextResponse.json({ error: companyError.message }, { status: 500 })
    }

    const { error: profileError } = await admin
      .from('profiles')
      .update({
        full_name: resolvedFullName,
        phone: phone || '',
        ...(firstName ? { first_name: firstName } : {}),
        ...(lastName ? { last_name: lastName } : {}),
        ...(username ? { username } : {}),
        email: user.email ?? '',
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('[onboard] Profile update error:', profileError)
    }

    companyId = existing.company_id
  } else {
    // Create company
    const { data: company, error: companyError } = await admin
      .from('companies')
      .insert({
        name: companyName,
        owner_id: user.id,
        phone: phone || '',
        business_type: businessTypeStr,
      })
      .select()
      .single()

    if (companyError) {
      return NextResponse.json({ error: companyError.message }, { status: 500 })
    }

    const profilePayload = {
      id: user.id,
      company_id: company.id,
      role: 'owner' as const,
      full_name: resolvedFullName,
      phone: phone || '',
      email: user.email ?? '',
      ...(firstName ? { first_name: firstName } : {}),
      ...(lastName ? { last_name: lastName } : {}),
      ...(username ? { username } : {}),
    }

    if (existing) {
      // Profile row exists but no company — update it
      const { error: profileError } = await admin
        .from('profiles')
        .update(profilePayload)
        .eq('id', user.id)

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }
    } else {
      // No profile at all — insert
      const { error: profileError } = await admin
        .from('profiles')
        .insert(profilePayload)

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }
    }

    companyId = company.id
  }

  // Seed company_services from all selected business type catalogs
  const mergedServices = getMergedServices(businessTypes)
  const servicesToInsert = mergedServices.map((s, i) => ({
    company_id: companyId,
    name: s.name,
    default_price: s.defaultPrice,
    category: s.category,
    sort_order: i,
  }))

  await admin.from('company_services').delete().eq('company_id', companyId)

  const { error: seedError } = await admin
    .from('company_services')
    .insert(servicesToInsert)

  if (seedError) {
    console.error('[onboard] Service seed error:', seedError)
  }

  // Send welcome email via Resend
  if (sendWelcomeEmail && user.email) {
    const html = welcomeEmailHtml({
      email: user.email,
      fullName: resolvedFullName,
      role: 'company',
    })
    const emailResult = await sendEmail({
      to: user.email,
      subject: `Welcome to KleanHQ, ${firstName || resolvedFullName.split(' ')[0]}!`,
      html,
    })
    if (!emailResult.success) {
      console.error('[onboard] Welcome email failed:', emailResult.error)
    }
  }

  return NextResponse.json({ success: true, companyId })
}
