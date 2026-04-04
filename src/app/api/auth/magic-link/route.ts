import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send'
import { magicLinkEmailHtml } from '@/lib/email/templates/magic-link'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, redirectTo } = await request.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kleanhq.com'

  // Generate the magic link without sending any Supabase email
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: email.toLowerCase().trim(),
    options: {
      redirectTo: redirectTo ?? `${origin}/auth/callback`,
    },
  })

  if (error || !data?.properties?.action_link) {
    console.error('[auth/magic-link] generateLink error:', error)
    return NextResponse.json(
      { error: 'Failed to generate magic link. Please try again.' },
      { status: 500 },
    )
  }

  const link = data.properties.action_link

  // Send the magic link via Resend — zero Supabase emails
  const html = magicLinkEmailHtml({ email, link })
  const result = await sendEmail({
    to: email,
    subject: 'Your KleanHQ sign-in link',
    html,
  })

  if (!result.success) {
    console.error('[auth/magic-link] Resend error:', result.error)
    return NextResponse.json(
      { error: 'Failed to send email. Please try again.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true })
}
