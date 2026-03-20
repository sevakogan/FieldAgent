import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNotification } from "@/lib/notifications/send";
import { sendEmail } from "@/lib/email/send";
import { reviewRequestEmailHtml } from "@/lib/email/templates/review-request";

const CRON_SECRET = process.env.CRON_SECRET ?? "";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  try {
    // Find companies with auto review sending enabled
    const { data: companies, error: compError } = await admin
      .from("companies")
      .select("id, name, review_auto_send_hours, review_smart_gate, review_links")
      .gt("review_auto_send_hours", 0);

    if (compError) {
      console.error("[cron/review-requests] Failed to fetch companies:", compError);
      return NextResponse.json({ error: compError.message }, { status: 500 });
    }

    let sent = 0;
    let skipped = 0;

    for (const company of companies ?? []) {
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - company.review_auto_send_hours);

      // Get completed jobs that haven't had review requests sent
      const { data: jobs, error: jobError } = await admin
        .from("jobs")
        .select("id, client_id, service, date, completed_at")
        .eq("company_id", company.id)
        .eq("status", "completed")
        .eq("review_requested", false)
        .lt("completed_at", cutoff.toISOString());

      if (jobError || !jobs?.length) continue;

      const reviewUrl = company.review_links?.google ?? `https://kleanhq.com/review/${company.id}`;

      for (const job of jobs) {
        // Smart gate: skip if client gave low internal rating
        if (company.review_smart_gate) {
          const { data: feedback } = await admin
            .from("job_feedback")
            .select("rating")
            .eq("job_id", job.id)
            .single();

          if (feedback && feedback.rating < 4) {
            skipped++;
            await admin
              .from("jobs")
              .update({ review_requested: true })
              .eq("id", job.id);
            continue;
          }
        }

        // Get client info
        const { data: client } = await admin
          .from("clients")
          .select("user_id")
          .eq("id", job.client_id)
          .single();

        if (!client?.user_id) continue;

        const { data: profile } = await admin
          .from("profiles")
          .select("full_name")
          .eq("id", client.user_id)
          .single();

        const { data: authUser } = await admin.auth.admin.getUserById(client.user_id);

        // Send email
        if (authUser?.user?.email) {
          await sendEmail({
            to: authUser.user.email,
            subject: `How was your ${job.service}?`,
            html: reviewRequestEmailHtml({
              clientName: profile?.full_name ?? "Valued Customer",
              service: job.service,
              companyName: company.name,
              reviewUrl,
              date: job.date,
            }),
          });
        }

        // Send in-app notification
        await sendNotification(client.user_id, "review_request", {
          service: job.service,
          companyName: company.name,
          reviewLink: reviewUrl,
        });

        await admin
          .from("jobs")
          .update({ review_requested: true })
          .eq("id", job.id);

        sent++;
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      skipped,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[cron/review-requests] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
