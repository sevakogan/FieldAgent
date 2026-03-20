const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? "";
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER ?? "";
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER ?? "";
const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID ?? "";

interface TwilioSendResult {
  readonly success: boolean;
  readonly sid?: string;
  readonly error?: string;
}

async function twilioRequest(
  endpoint: string,
  body: URLSearchParams,
): Promise<TwilioSendResult> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.warn("[twilio] Credentials not configured — skipping send");
    return { success: false, error: "Twilio credentials not configured" };
  }

  const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
        body,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("[twilio] Send failed:", data);
      return { success: false, error: data.message ?? "Send failed" };
    }

    return { success: true, sid: data.sid };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[twilio] Request error:", message);
    return { success: false, error: message };
  }
}

export async function sendSms(
  to: string,
  body: string,
): Promise<TwilioSendResult> {
  const params = new URLSearchParams({
    To: to,
    Body: body,
  });

  // Use messaging service if available, otherwise use phone number
  if (TWILIO_MESSAGING_SERVICE_SID) {
    params.set("MessagingServiceSid", TWILIO_MESSAGING_SERVICE_SID);
  } else {
    params.set("From", TWILIO_PHONE_NUMBER);
  }

  return twilioRequest("Messages.json", params);
}

export async function sendWhatsApp(
  to: string,
  body: string,
): Promise<TwilioSendResult> {
  const whatsappTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  const whatsappFrom = TWILIO_WHATSAPP_NUMBER.startsWith("whatsapp:")
    ? TWILIO_WHATSAPP_NUMBER
    : `whatsapp:${TWILIO_WHATSAPP_NUMBER}`;

  const params = new URLSearchParams({
    To: whatsappTo,
    From: whatsappFrom,
    Body: body,
  });

  return twilioRequest("Messages.json", params);
}

export interface IncomingMessage {
  readonly from: string;
  readonly to: string;
  readonly body: string;
  readonly messageSid: string;
  readonly numMedia: number;
  readonly mediaUrls: readonly string[];
  readonly isWhatsApp: boolean;
}

export function parseIncomingWebhook(formData: Record<string, string>): IncomingMessage {
  const from = formData.From ?? "";
  const mediaUrls: string[] = [];
  const numMedia = parseInt(formData.NumMedia ?? "0", 10);

  for (let i = 0; i < numMedia; i++) {
    const url = formData[`MediaUrl${i}`];
    if (url) mediaUrls.push(url);
  }

  return {
    from: from.replace("whatsapp:", ""),
    to: (formData.To ?? "").replace("whatsapp:", ""),
    body: formData.Body ?? "",
    messageSid: formData.MessageSid ?? "",
    numMedia,
    mediaUrls,
    isWhatsApp: from.startsWith("whatsapp:"),
  };
}

export function handleIncoming(formData: Record<string, string>): {
  readonly message: IncomingMessage;
  readonly twimlResponse: string;
} {
  const message = parseIncomingWebhook(formData);

  // Return empty TwiML — actual response logic handled by caller
  const twimlResponse = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

  return { message, twimlResponse };
}
