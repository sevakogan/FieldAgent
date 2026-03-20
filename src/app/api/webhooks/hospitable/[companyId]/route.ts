import { NextResponse } from "next/server";
import { handleHospitableWebhook } from "@/lib/integrations/hospitable";
import type { HospitableWebhookPayload } from "@/lib/integrations/hospitable";

const HOSPITABLE_WEBHOOK_SECRET = process.env.HOSPITABLE_WEBHOOK_SECRET ?? "";

function verifySignature(body: string, signature: string | null): boolean {
  if (!HOSPITABLE_WEBHOOK_SECRET) return true; // Skip in dev
  if (!signature) return false;
  // TODO: Implement HMAC verification with Hospitable's signing key
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
  const signature = request.headers.get("x-hospitable-signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: HospitableWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!payload.event || !payload.reservation) {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const result = await handleHospitableWebhook(companyId, payload);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
