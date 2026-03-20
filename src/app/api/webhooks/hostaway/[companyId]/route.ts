import { NextResponse } from "next/server";
import { handleHostawayWebhook } from "@/lib/integrations/hostaway";
import type { HostawayWebhookPayload } from "@/lib/integrations/hostaway";

const HOSTAWAY_WEBHOOK_SECRET = process.env.HOSTAWAY_WEBHOOK_SECRET ?? "";

function verifySignature(body: string, signature: string | null): boolean {
  if (!HOSTAWAY_WEBHOOK_SECRET) return true;
  if (!signature) return false;
  // TODO: Implement HMAC verification with Hostaway's signing key
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
  const signature = request.headers.get("x-hostaway-signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: HostawayWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!payload.event || !payload.data) {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const result = await handleHostawayWebhook(companyId, payload);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
