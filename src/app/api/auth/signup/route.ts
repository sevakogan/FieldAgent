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
    firstName: rawFirst,
    lastName: rawLast,
    fullName: rawFullName,
    username,
    phone,
    companyName,
    businessType: rawBusinessType = 'lawn_care',
  } = body

  // Accept either firstName+lastName or fullName (split on first space)
  const firstName = rawFirst || rawFullName?.trim().split(/\s+/)[0] || ''
  const lastName = rawLast || rawFullName?.trim().split(/\s+/).slice(1).join(' ') || ''

  if (!email || !password || !firstName || !companyName) {
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

  // 1. Create auth user via admin API — auto-confirmed, NO Supabase email sent
  let userId: string
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

    if (!isDuplicate) {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    // Auth user exists — check if signup was completed
    const { data: existingUsers } = await admin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    )

    if (!existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in or reset your password.' },
        { status: 409 },
      )
    }

    // Check if company already created (signup fully completed)
    const { data: existingCompany } = await admin
      .from('companies')
      .select('id')
      .eq('owner_id', existingUser.id)
      .maybeSingle()

    if (existingCompany) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in or reset your password.' },
        { status: 409 },
      )
    }

    // Orphaned auth user — resume signup, update password
    await admin.auth.admin.updateUserById(existingUser.id, { password })
    userId = existingUser.id
  } else {
    userId = userData.user.id
  }

  // 2. Create public.users row (used by all business logic)
  const { error: usersError } = await admin
    .from('users')
    .upsert({
      id: userId,
      email,
      full_name: fullName,
      phone: phone || null,
      role: 'owner',
    }, { onConflict: 'id', ignoreDuplicates: false })

  if (usersError) {
    console.error('[auth/signup] Users table error:', usersError)
    await admin.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: usersError.message }, { status: 500 })
  }

  // 3. Create company
  const slug =
    companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
    '-' +
    Date.now().toString(36)

  const { data: company, error: companyError } = await admin
    .from('companies')
    .insert({
      name: companyName,
      slug,
      owner_id: userId,
      phone: phone || '',
      business_type: businessTypeStr,
    })
    .select()
    .single()

  if (companyError) {
    await admin.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: companyError.message }, { status: 500 })
  }

  // 4. Create company_members row (links user to company with role)
  const { error: memberError } = await admin
    .from('company_members')
    .upsert({
      company_id: company.id,
      user_id: userId,
      role: 'owner',
      status: 'active',
    }, { onConflict: 'company_id,user_id', ignoreDuplicates: true })

  if (memberError) {
    console.error('[auth/signup] Company member error:', memberError)
    // Non-fatal: company and user exist, member link can be fixed later
  }

  // 5. Create profiles row (used by auth session for company_id lookup)
  const { error: profileError } = await admin
    .from('profiles')
    .upsert({
      id: userId,
      company_id: company.id,
      role: 'owner',
      full_name: fullName,
      phone: phone || '',
      email,
      ...(firstName ? { first_name: firstName } : {}),
      ...(lastName ? { last_name: lastName } : {}),
      ...(username ? { username } : {}),
    }, { onConflict: 'id', ignoreDuplicates: false })

  if (profileError) {
    console.error('[auth/signup] Profile error:', profileError)
    // Non-fatal: session will fall back to bootstrap pattern
  }

  // 6. Seed company services
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

  // 7. Send welcome email via Resend
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
