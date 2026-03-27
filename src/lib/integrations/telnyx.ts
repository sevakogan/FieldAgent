/**
 * Telnyx SMS integration — replaces Twilio.
 * Uses Telnyx v2 Messaging API.
 * Docs: https://developers.telnyx.com/api/messaging/send-message
 */

const TELNYX_API_KEY = process.env.TELNYX_API_KEY ?? ''
const TELNYX_FROM_NUMBER = process.env.TELNYX_FROM_NUMBER ?? ''
const TELNYX_MESSAGING_PROFILE_ID = process.env.TELNYX_MESSAGING_PROFILE_ID ?? ''

const TELNYX_API_URL = 'https://api.telnyx.com/v2/messages'

export interface SmsSendResult {
  readonly success: boolean
  readonly messageId?: string
  readonly error?: string
}

/**
 * Send an SMS via Telnyx.
 * Uses messaging_profile_id if available, otherwise uses from number.
 */
export async function sendSms(
  to: string,
  body: string,
): Promise<SmsSendResult> {
  if (!TELNYX_API_KEY) {
    console.warn('[telnyx] TELNYX_API_KEY not configured — skipping SMS')
    return { success: false, error: 'Telnyx API key not configured' }
  }

  if (!TELNYX_FROM_NUMBER && !TELNYX_MESSAGING_PROFILE_ID) {
    console.warn('[telnyx] No from number or messaging profile configured — skipping SMS')
    return { success: false, error: 'Telnyx from number not configured' }
  }

  // Normalize phone number to E.164 format
  const normalizedTo = normalizePhone(to)
  if (!normalizedTo) {
    return { success: false, error: `Invalid phone number: ${to}` }
  }

  const payload: Record<string, string> = {
    to: normalizedTo,
    text: body,
    type: 'SMS',
  }

  // Use messaging profile if available, otherwise from number
  if (TELNYX_MESSAGING_PROFILE_ID) {
    payload.messaging_profile_id = TELNYX_MESSAGING_PROFILE_ID
  } else {
    payload.from = TELNYX_FROM_NUMBER
  }

  try {
    const response = await fetch(TELNYX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TELNYX_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMsg = data?.errors?.[0]?.detail ?? data?.detail ?? 'Send failed'
      console.error('[telnyx] SMS send failed:', errorMsg)
      return { success: false, error: errorMsg }
    }

    const messageId = data?.data?.id ?? undefined
    return { success: true, messageId }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[telnyx] Request error:', message)
    return { success: false, error: message }
  }
}

/**
 * Send an MMS (SMS with media) via Telnyx.
 */
export async function sendMms(
  to: string,
  body: string,
  mediaUrls: readonly string[],
): Promise<SmsSendResult> {
  if (!TELNYX_API_KEY) {
    console.warn('[telnyx] TELNYX_API_KEY not configured — skipping MMS')
    return { success: false, error: 'Telnyx API key not configured' }
  }

  const normalizedTo = normalizePhone(to)
  if (!normalizedTo) {
    return { success: false, error: `Invalid phone number: ${to}` }
  }

  const payload: Record<string, unknown> = {
    to: normalizedTo,
    text: body,
    type: 'MMS',
    media_urls: mediaUrls,
  }

  if (TELNYX_MESSAGING_PROFILE_ID) {
    payload.messaging_profile_id = TELNYX_MESSAGING_PROFILE_ID
  } else {
    payload.from = TELNYX_FROM_NUMBER
  }

  try {
    const response = await fetch(TELNYX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TELNYX_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMsg = data?.errors?.[0]?.detail ?? 'MMS send failed'
      console.error('[telnyx] MMS send failed:', errorMsg)
      return { success: false, error: errorMsg }
    }

    return { success: true, messageId: data?.data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[telnyx] MMS request error:', message)
    return { success: false, error: message }
  }
}

/**
 * Parse an incoming Telnyx webhook payload.
 */
export interface IncomingMessage {
  readonly from: string
  readonly to: string
  readonly body: string
  readonly messageId: string
  readonly mediaUrls: readonly string[]
  readonly direction: string
}

export function parseIncomingWebhook(payload: Record<string, unknown>): IncomingMessage | null {
  const data = (payload?.data as Record<string, unknown>) ?? {}
  const eventPayload = (data?.payload as Record<string, unknown>) ?? {}

  return {
    from: (eventPayload?.from as Record<string, string>)?.phone_number ?? '',
    to: ((eventPayload?.to as Record<string, string>[]) ?? [])[0]?.phone_number ?? '',
    body: (eventPayload?.text as string) ?? '',
    messageId: (eventPayload?.id as string) ?? '',
    mediaUrls: ((eventPayload?.media as Record<string, string>[]) ?? []).map(m => m.url),
    direction: (eventPayload?.direction as string) ?? 'inbound',
  }
}

/**
 * Normalize a US phone number to E.164 format (+1XXXXXXXXXX).
 */
function normalizePhone(phone: string): string | null {
  // Strip everything except digits and leading +
  const cleaned = phone.replace(/[^\d+]/g, '')

  // Already E.164
  if (/^\+1\d{10}$/.test(cleaned)) return cleaned

  // US number without country code
  const digits = cleaned.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`

  // International — pass through if it has a +
  if (cleaned.startsWith('+') && cleaned.length >= 10) return cleaned

  return null
}
