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
    // Find companies with auto-approve enabled
    const { data: companies, error: compError } = await admin
      .from("companies")
      .select("id, auto_approve_timeout_hours, owner_id")
      .gt("auto_approve_timeout_hours", 0);

    if (compError) {
      console.error("[cron/auto-approve] Failed to fetch companies:", compError);
      return NextResponse.json({ error: compError.message }, { status: 500 });
    }

    let approved = 0;
    let failed = 0;

    for (const company of companies ?? []) {
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - company.auto_approve_timeout_hours);

      const { data: jobs, error: jobError } = await admin
        .from("jobs")
        .select("id, worker_id")
        .eq("company_id", company.id)
        .eq("status", "requested")
        .lt("created_at", cutoff.toISOString());

      if (jobError) {
        console.error(`[cron/auto-approve] Error for company ${company.id}:`, jobError);
        failed++;
        continue;
      }

      for (const job of jobs ?? []) {
        const { error: updateError } = await admin
          .from("jobs")
          .update({ status: "approved" })
          .eq("id", job.id);

        if (updateError) {
          failed++;
        } else {
          approved++;
          // Notify assigned worker if any
          if (job.worker_id) {
            await sendNotification(job.worker_id, "job_assigned", {
              jobId: job.id,
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      approved,
      failed,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[cron/auto-approve] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
