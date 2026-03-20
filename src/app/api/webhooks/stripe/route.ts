import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNotification } from "@/lib/notifications/send";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

// Stripe sends raw body — we need to verify the signature
async function verifyStripeSignature(
  rawBody: string,
  signature: string | null,
): Promise<boolean> {
  if (!STRIPE_WEBHOOK_SECRET) return true; // Skip in dev
  if (!signature) return false;

  try {
    // Use Stripe's recommended HMAC-SHA256 verification
    const crypto = await import("crypto");
    const elements = signature.split(",");
    const timestamp = elements.find((e) => e.startsWith("t="))?.split("=")[1];
    const v1Signature = elements.find((e) => e.startsWith("v1="))?.split("=")[1];

    if (!timestamp || !v1Signature) return false;

    const payload = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac("sha256", STRIPE_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(v1Signature),
      Buffer.from(expectedSignature),
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  const isValid = await verifyStripeSignature(rawBody, signature);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = event.data.object as any;
        const companyId = session.metadata?.company_id as string | undefined;
        if (companyId) {
          await admin
            .from("companies")
            .update({ stripe_account_id: session.customer as string })
            .eq("id", companyId);
        }
        break;
      }

      case "invoice.paid": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        const invoiceId = invoice.metadata?.kleanhq_invoice_id as string | undefined;
        if (invoiceId) {
          await admin
            .from("invoices")
            .update({ status: "paid", paid_at: new Date().toISOString() })
            .eq("id", invoiceId);

          // Notify company owner
          const { data: inv } = await admin
            .from("invoices")
            .select("company_id")
            .eq("id", invoiceId)
            .single();

          if (inv) {
            const { data: company } = await admin
              .from("companies")
              .select("owner_id")
              .eq("id", inv.company_id)
              .single();

            if (company?.owner_id) {
              await sendNotification(company.owner_id, "payment_received", {
                amount: ((invoice.amount_paid as number) / 100).toFixed(2),
                invoiceNumber: invoiceId,
              });
            }
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        const invoiceId = invoice.metadata?.kleanhq_invoice_id as string | undefined;
        if (invoiceId) {
          await admin
            .from("invoices")
            .update({ status: "failed" })
            .eq("id", invoiceId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscription = event.data.object as any;
        const companyId = subscription.metadata?.company_id as string | undefined;
        if (companyId) {
          await admin
            .from("companies")
            .update({ status: "suspended" })
            .eq("id", companyId);
        }
        break;
      }

      default:
        console.log(`[stripe] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe] Webhook processing error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
