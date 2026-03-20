import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNotification } from "@/lib/notifications/send";
import { sendEmail } from "@/lib/email/send";

const CRON_SECRET = process.env.CRON_SECRET ?? "";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  try {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(now.getDate() + 1);

    // Find companies whose trial expires in 3 days (warning)
    const { data: warningCompanies } = await admin
      .from("companies")
      .select("id, name, owner_id, trial_ends_at")
      .eq("status", "trial")
      .gte("trial_ends_at", threeDaysFromNow.toISOString().split("T")[0])
      .lt("trial_ends_at", new Date(threeDaysFromNow.getTime() + 86400000).toISOString().split("T")[0]);

    let warned = 0;
    let expired = 0;

    for (const company of warningCompanies ?? []) {
      await sendNotification(company.owner_id, "payment_failed", {
        companyName: company.name,
        message: "Your free trial expires in 3 days. Add a payment method to keep your account active.",
      });

      const { data: authUser } = await admin.auth.admin.getUserById(company.owner_id);
      if (authUser?.user?.email) {
        await sendEmail({
          to: authUser.user.email,
          subject: "Your KleanHQ trial expires in 3 days",
          html: `
            <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
              <h2 style="color:#1d1d1f;">Your trial is ending soon</h2>
              <p style="color:#424245;font-size:15px;line-height:1.6;">
                Your KleanHQ free trial for <strong>${company.name}</strong> expires in 3 days.
                Add a payment method to continue using all features.
              </p>
              <div style="text-align:center;margin:24px 0;">
                <a href="https://kleanhq.com/settings" style="background:#0071e3;color:#fff;text-decoration:none;padding:14px 32px;border-radius:980px;font-weight:600;display:inline-block;">
                  Upgrade Now
                </a>
              </div>
            </div>
          `.trim(),
        });
      }
      warned++;
    }

    // Find companies whose trial has expired
    const { data: expiredCompanies } = await admin
      .from("companies")
      .select("id, name, owner_id")
      .eq("status", "trial")
      .lt("trial_ends_at", now.toISOString());

    for (const company of expiredCompanies ?? []) {
      await admin
        .from("companies")
        .update({ status: "suspended" })
        .eq("id", company.id);

      await sendNotification(company.owner_id, "payment_failed", {
        companyName: company.name,
        message: "Your free trial has expired. Upgrade to continue using KleanHQ.",
      });

      expired++;
    }

    return NextResponse.json({
      success: true,
      warned,
      expired,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[cron/trial-expiry] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
