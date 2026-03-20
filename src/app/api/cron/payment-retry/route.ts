import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNotification } from "@/lib/notifications/send";

const CRON_SECRET = process.env.CRON_SECRET ?? "";
const MAX_RETRIES = 3;
const RETRY_INTERVAL_DAYS = 3;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  try {
    // Find failed invoices eligible for retry
    const retryBefore = new Date();
    retryBefore.setDate(retryBefore.getDate() - RETRY_INTERVAL_DAYS);

    const { data: failedInvoices, error } = await admin
      .from("invoices")
      .select("id, company_id, client_id, amount, retry_count")
      .eq("status", "failed")
      .lt("retry_count", MAX_RETRIES)
      .lt("updated_at", retryBefore.toISOString());

    if (error) {
      console.error("[cron/payment-retry] Failed to fetch invoices:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let retried = 0;
    let exhausted = 0;

    for (const invoice of failedInvoices ?? []) {
      const retryCount = (invoice.retry_count ?? 0) + 1;

      // TODO: Implement actual Stripe payment retry via API
      // For now, update retry count and mark for manual review if exhausted
      if (retryCount >= MAX_RETRIES) {
        await admin
          .from("invoices")
          .update({
            status: "overdue",
            retry_count: retryCount,
          })
          .eq("id", invoice.id);

        // Notify company owner
        const { data: company } = await admin
          .from("companies")
          .select("owner_id")
          .eq("id", invoice.company_id)
          .single();

        if (company?.owner_id) {
          await sendNotification(company.owner_id, "payment_failed", {
            amount: invoice.amount?.toFixed(2),
            invoiceId: invoice.id,
          });
        }

        exhausted++;
      } else {
        await admin
          .from("invoices")
          .update({ retry_count: retryCount })
          .eq("id", invoice.id);

        // Notify client about upcoming retry
        const { data: clientUser } = await admin
          .from("clients")
          .select("user_id")
          .eq("id", invoice.client_id)
          .single();

        const nextRetry = new Date();
        nextRetry.setDate(nextRetry.getDate() + RETRY_INTERVAL_DAYS);

        if (clientUser?.user_id) {
          await sendNotification(clientUser.user_id, "payment_failed", {
            amount: invoice.amount?.toFixed(2),
            retryDate: nextRetry.toISOString().split("T")[0],
          });
        }

        retried++;
      }
    }

    return NextResponse.json({
      success: true,
      retried,
      exhausted,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[cron/payment-retry] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
