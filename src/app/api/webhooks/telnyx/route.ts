import { NextResponse } from 'next/server'
import { parseIncomingWebhook } from '@/lib/integrations/telnyx'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Telnyx inbound message webhook.
 * Configure at: https://portal.telnyx.com → Messaging → Inbound Settings
 * Set webhook URL to: https://kleanhq.com/api/webhooks/telnyx
 */
export async function POST(request: Request) {
  let payload: Record<string, unknown>

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Telnyx sends different event types — we only care about message.received
  const eventType = (payload?.data as Record<string, unknown>)?.event_type
  if (eventType !== 'message.received') {
    // Acknowledge but ignore other events (delivery reports, etc.)
    return NextResponse.json({ ok: true })
  }

  const message = parseIncomingWebhook(payload)
  if (!message || !message.from) {
    return NextResponse.json({ error: 'Could not parse message' }, { status: 400 })
  }

  // Log the incoming message to the database
  const admin = createAdminClient()
  try {
    // Find user by phone number (try with and without +1 prefix)
    const phoneVariants = [message.from, message.from.replace(/^\+1/, '')]
    const { data: profile } = await admin
      .from('profiles')
      .select('id, company_id')
      .in('phone', phoneVariants)
      .limit(1)
      .single()

    if (profile) {
      await admin.from('messages').insert({
        user_id: profile.id,
        company_id: profile.company_id,
        channel: 'sms',
        direction: 'inbound',
        from_number: message.from,
        body: message.body,
        external_id: message.messageId,
      })
    }
  } catch (err) {
    console.error('[telnyx-webhook] Failed to log message:', err)
  }

  return NextResponse.json({ ok: true })
}
