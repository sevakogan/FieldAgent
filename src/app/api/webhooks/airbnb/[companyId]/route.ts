import { NextResponse } from "next/server";
import { handleAirbnbWebhook } from "@/lib/integrations/airbnb";
import type { AirbnbWebhookPayload } from "@/lib/integrations/airbnb";

const AIRBNB_WEBHOOK_SECRET = process.env.AIRBNB_WEBHOOK_SECRET ?? "";

function verifySignature(body: string, signature: string | null): boolean {
  if (!AIRBNB_WEBHOOK_SECRET) return true;
  if (!signature) return false;
  // TODO: Implement HMAC verification with Airbnb's signing key
  return true;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> },
) {
  const { companyId } = await params;

  if (!companyId) {
    return NextResponse.json({ error: "Company ID required" }, { status: 400 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-airbnb-signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: AirbnbWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!payload.event_type || !payload.reservation) {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const result = await handleAirbnbWebhook(companyId, payload);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
