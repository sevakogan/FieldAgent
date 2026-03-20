import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";

const CRON_SECRET = process.env.CRON_SECRET ?? "";

interface DripStep {
  readonly dayAfterSignup: number;
  readonly subject: string;
  readonly body: (companyName: string) => string;
}

const DRIP_SEQUENCE: readonly DripStep[] = [
  {
    dayAfterSignup: 1,
    subject: "Quick tip: Set up your services",
    body: (name) => `
      <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <h2 style="color:#1d1d1f;">Set up your services, ${name}</h2>
        <p style="color:#424245;font-size:15px;line-height:1.6;">
          The first step to getting the most out of KleanHQ is setting up your service catalog.
          Define your services, set pricing, and customize checklists.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://kleanhq.com/settings" style="background:#0071e3;color:#fff;text-decoration:none;padding:14px 32px;border-radius:980px;font-weight:600;display:inline-block;">
            Set Up Services
          </a>
        </div>
      </div>
    `.trim(),
  },
  {
    dayAfterSignup: 3,
    subject: "Invite your team",
    body: (name) => `
      <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <h2 style="color:#1d1d1f;">Build your team, ${name}</h2>
        <p style="color:#424245;font-size:15px;line-height:1.6;">
          Invite your workers and leads to KleanHQ. They'll get their own mobile-friendly portal
          to view schedules, update job status, and communicate with clients.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://kleanhq.com/settings" style="background:#0071e3;color:#fff;text-decoration:none;padding:14px 32px;border-radius:980px;font-weight:600;display:inline-block;">
            Invite Team Members
          </a>
        </div>
      </div>
    `.trim(),
  },
  {
    dayAfterSignup: 5,
    subject: "Add your first client",
    body: (name) => `
      <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <h2 style="color:#1d1d1f;">Add clients to ${name}</h2>
        <p style="color:#424245;font-size:15px;line-height:1.6;">
          Add your clients and their properties to start scheduling jobs.
          Clients can also self-serve through their own portal.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://kleanhq.com/contacts" style="background:#0071e3;color:#fff;text-decoration:none;padding:14px 32px;border-radius:980px;font-weight:600;display:inline-block;">
            Add Clients
          </a>
        </div>
      </div>
    `.trim(),
  },
  {
    dayAfterSignup: 7,
    subject: "Connect your calendar & integrations",
    body: (name) => `
      <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <h2 style="color:#1d1d1f;">Supercharge ${name} with integrations</h2>
        <p style="color:#424245;font-size:15px;line-height:1.6;">
          Connect Google Calendar, Airbnb, VRBO, QuickBooks, and more to automate your workflow.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://kleanhq.com/settings" style="background:#0071e3;color:#fff;text-decoration:none;padding:14px 32px;border-radius:980px;font-weight:600;display:inline-block;">
            View Integrations
          </a>
        </div>
      </div>
    `.trim(),
  },
  {
    dayAfterSignup: 14,
    subject: "How's it going? We'd love to help",
    body: (name) => `
      <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <h2 style="color:#1d1d1f;">Two weeks with KleanHQ</h2>
        <p style="color:#424245;font-size:15px;line-height:1.6;">
          You've been using KleanHQ for ${name} for two weeks now. How's it going?
          If you need any help getting set up, just reply to this email.
        </p>
        <p style="color:#424245;font-size:15px;line-height:1.6;">
          You can also use the AI assistant in your dashboard for instant help.
        </p>
      </div>
    `.trim(),
  },
];

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  try {
    let sent = 0;
    let failed = 0;

    for (const step of DRIP_SEQUENCE) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - step.dayAfterSignup);
      const dateStr = targetDate.toISOString().split("T")[0];

      // Find companies created on the target date that haven't received this drip
      const { data: companies } = await admin
        .from("companies")
        .select("id, name, owner_id, created_at")
        .gte("created_at", `${dateStr}T00:00:00`)
        .lt("created_at", `${dateStr}T23:59:59`);

      for (const company of companies ?? []) {
        // Check if already sent
        const { data: existing } = await admin
          .from("drip_log")
          .select("id")
          .eq("company_id", company.id)
          .eq("step_day", step.dayAfterSignup)
          .single();

        if (existing) continue;

        const { data: authUser } = await admin.auth.admin.getUserById(company.owner_id);
        if (!authUser?.user?.email) continue;

        const result = await sendEmail({
          to: authUser.user.email,
          subject: step.subject,
          html: step.body(company.name),
        });

        if (result.success) {
          await admin.from("drip_log").insert({
            company_id: company.id,
            step_day: step.dayAfterSignup,
            sent_at: new Date().toISOString(),
          });
          sent++;
        } else {
          failed++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[cron/onboarding-drip] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
