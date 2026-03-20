import { NextResponse } from "next/server";
import { handleIncoming } from "@/lib/integrations/twilio";
import { createAdminClient } from "@/lib/supabase/admin";

const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? "";

function verifyTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string | null,
): boolean {
  if (!TWILIO_AUTH_TOKEN) return true; // Skip in dev
  if (!signature) return false;
  // TODO: Implement Twilio signature validation using auth token
  // https://www.twilio.com/docs/usage/security#validating-requests
  return true;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = String(value);
  });

  const signature = request.headers.get("x-twilio-signature");
  const requestUrl = request.url;

  if (!verifyTwilioSignature(requestUrl, params, signature)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { message, twimlResponse } = handleIncoming(params);

  // Log the incoming message
  const admin = createAdminClient();
  try {
    // Find user by phone number
    const { data: profile } = await admin
      .from("profiles")
      .select("id, company_id")
      .eq("phone", message.from)
      .single();

    if (profile) {
      await admin.from("messages").insert({
        user_id: profile.id,
        company_id: profile.company_id,
        channel: message.isWhatsApp ? "whatsapp" : "sms",
        direction: "inbound",
        from_number: message.from,
        body: message.body,
        external_id: message.messageSid,
      });
    }
  } catch (err) {
    console.error("[twilio-webhook] Failed to log message:", err);
  }

  return new Response(twimlResponse, {
    headers: { "Content-Type": "text/xml" },
  });
}
