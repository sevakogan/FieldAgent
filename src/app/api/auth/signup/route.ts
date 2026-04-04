import { createAdminClient } from '@/lib/supabase/admin'
import { getMergedServices } from '@/lib/service-catalog'
import { sendEmail } from '@/lib/email/send'
import { welcomeEmailHtml } from '@/lib/email/templates/welcome'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const {
    email,
    password,
    firstName,
    lastName,
    username,
    phone,
    companyName,
    businessType: rawBusinessType = 'lawn_care',
  } = body

  if (!email || !password || !firstName || !lastName || !companyName) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 },
    )
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: 'Password must be at least 6 characters' },
      { status: 400 },
    )
  }

  const admin = createAdminClient()
  const fullName = `${firstName} ${lastName}`.trim()
  const businessTypeStr = Array.isArray(rawBusinessType)
    ? rawBusinessType.filter(Boolean).join(',')
    : typeof rawBusinessType === 'string'
      ? rawBusinessType
      : 'lawn_care'
  const businessTypes = Array.isArray(rawBusinessType)
    ? rawBusinessType.filter(Boolean)
    : typeof rawBusinessType === 'string'
      ? rawBusinessType.split(',').filter(Boolean)
      : ['lawn_care']

  // 1. Create user via admin API — auto-confirmed, NO Supabase email sent
  const { data: userData, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'company_owner',
      first_name: firstName,
      last_name: lastName,
      username: username || '',
      business_name: companyName,
      business_type: businessTypeStr,
      phone: phone || '',
    },
  })

  if (createError) {
    const msg = createError.message?.toLowerCase() ?? ''
    const isDuplicate =
      msg.includes('already registered') ||
      msg.includes('already been registered') ||
      msg.includes('already exists') ||
      msg.includes('email address is already')
    if (isDuplicate) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in or reset your password.' },
        { status: 409 },
      )
    }
    return NextResponse.json({ error: createError.message }, { status: 500 })
  }

  const user = userData.user

  // 2. Create company
  const slug =
    companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
    '-' +
    Date.now().toString(36)

  const { data: company, error: companyError } = await admin
    .from('companies')
    .insert({
      name: companyName,
      slug,
      owner_id: user.id,
      phone: phone || '',
      business_type: businessTypeStr,
    })
    .select()
    .single()

  if (companyError) {
    return NextResponse.json({ error: companyError.message }, { status: 500 })
  }

  // 3. Create profile
  const { error: profileError } = await admin
    .from('profiles')
    .insert({
      id: user.id,
      company_id: company.id,
      role: 'owner',
      full_name: fullName,
      phone: phone || '',
      email,
      ...(firstName ? { first_name: firstName } : {}),
      ...(lastName ? { last_name: lastName } : {}),
      ...(username ? { username } : {}),
    })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  // 4. Seed company services
  const mergedServices = getMergedServices(businessTypes)
  const servicesToInsert = mergedServices.map((s, i) => ({
    company_id: company.id,
    name: s.name,
    default_price: s.defaultPrice,
    category: s.category,
    sort_order: i,
  }))

  if (servicesToInsert.length > 0) {
    const { error: seedError } = await admin
      .from('company_services')
      .insert(servicesToInsert)

    if (seedError) {
      console.error('[auth/signup] Service seed error:', seedError)
    }
  }

  // 5. Send welcome email via Resend
  const html = welcomeEmailHtml({ email, fullName, role: 'company' })
  const emailResult = await sendEmail({
    to: email,
    subject: `Welcome to KleanHQ, ${firstName}!`,
    html,
  })

  if (!emailResult.success) {
    console.error('[auth/signup] Welcome email failed:', emailResult.error)
  }

  return NextResponse.json({ success: true, companyId: company.id })
}
