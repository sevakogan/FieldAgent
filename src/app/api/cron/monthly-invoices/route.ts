import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNotification } from "@/lib/notifications/send";

const CRON_SECRET = process.env.CRON_SECRET ?? "";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  try {
    // Find all client-company relationships with monthly billing
    const { data: monthlyClients, error } = await admin
      .from("client_companies")
      .select("id, client_id, company_id, stripe_customer_id")
      .eq("payment_schedule", "monthly");

    if (error) {
      console.error("[cron/monthly-invoices] Failed to fetch clients:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let created = 0;
    let failed = 0;

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    for (const clientCompany of monthlyClients ?? []) {
      // Get completed jobs for this billing period
      const { data: jobs, error: jobError } = await admin
        .from("jobs")
        .select("id, total, service, date")
        .eq("company_id", clientCompany.company_id)
        .eq("client_id", clientCompany.client_id)
        .eq("status", "completed")
        .gte("date", firstOfMonth.toISOString().split("T")[0])
        .lte("date", lastOfMonth.toISOString().split("T")[0])
        .is("invoice_id", null);

      if (jobError || !jobs?.length) {
        if (jobError) failed++;
        continue;
      }

      const totalAmount = jobs.reduce((sum, j) => sum + (j.total ?? 0), 0);

      if (totalAmount <= 0) continue;

      // Create invoice
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const { data: invoice, error: invoiceError } = await admin
        .from("invoices")
        .insert({
          company_id: clientCompany.company_id,
          client_id: clientCompany.client_id,
          amount: totalAmount,
          status: "pending",
          due_date: dueDate.toISOString().split("T")[0],
          line_items: jobs.map((j) => ({
            job_id: j.id,
            description: j.service,
            date: j.date,
            amount: j.total,
          })),
        })
        .select("id")
        .single();

      if (invoiceError || !invoice) {
        console.error("[cron/monthly-invoices] Failed to create invoice:", invoiceError);
        failed++;
        continue;
      }

      // Link jobs to invoice
      const jobIds = jobs.map((j) => j.id);
      await admin
        .from("jobs")
        .update({ invoice_id: invoice.id })
        .in("id", jobIds);

      // Notify client
      const { data: clientUser } = await admin
        .from("clients")
        .select("user_id")
        .eq("id", clientCompany.client_id)
        .single();

      if (clientUser?.user_id) {
        await sendNotification(clientUser.user_id, "invoice_created", {
          amount: totalAmount.toFixed(2),
          dueDate: dueDate.toISOString().split("T")[0],
        });
      }

      created++;
    }

    return NextResponse.json({
      success: true,
      created,
      failed,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[cron/monthly-invoices] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
