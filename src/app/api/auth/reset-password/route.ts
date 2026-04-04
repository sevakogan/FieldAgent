import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send'
import { passwordResetEmailHtml } from '@/lib/email/templates/password-reset'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kleanhq.com'

  // Generate the recovery link without sending any Supabase email
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email: email.toLowerCase().trim(),
    options: {
      // Go through auth/callback to exchange code, then redirect to the reset form
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    },
  })

  if (error || !data?.properties?.action_link) {
    // Don't reveal whether the email exists — always return success
    console.error('[auth/reset-password] generateLink error:', error)
    return NextResponse.json({ success: true })
  }

  const link = data.properties.action_link

  const html = passwordResetEmailHtml({ email, link })
  const result = await sendEmail({
    to: email,
    subject: 'Reset your KleanHQ password',
    html,
  })

  if (!result.success) {
    console.error('[auth/reset-password] Resend error:', result.error)
  }

  // Always return success — don't leak whether email exists
  return NextResponse.json({ success: true })
}
