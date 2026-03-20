import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  let body: {
    referralCode?: string;
    referredEmail?: string;
    referredUserId?: string;
    event?: "clicked" | "signed_up" | "qualified";
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { referralCode, referredEmail, referredUserId, event } = body;

  if (!referralCode || !event) {
    return NextResponse.json({ error: "referralCode and event are required" }, { status: 400 });
  }

  const validEvents = ["clicked", "signed_up", "qualified"];
  if (!validEvents.includes(event)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Look up the referral code
  const { data: referrer } = await admin
    .from("referral_codes")
    .select("id, user_id, company_id, referrer_type")
    .eq("code", referralCode)
    .eq("active", true)
    .single();

  if (!referrer) {
    return NextResponse.json({ error: "Invalid or inactive referral code" }, { status: 404 });
  }

  try {
    switch (event) {
      case "clicked": {
        // Track click
        await admin.from("referral_clicks").insert({
          referral_code_id: referrer.id,
          ip_hash: null, // Could hash IP for analytics without storing PII
        });
        break;
      }

      case "signed_up": {
        if (!referredEmail && !referredUserId) {
          return NextResponse.json({ error: "referredEmail or referredUserId required for signup event" }, { status: 400 });
        }

        // Create referral record
        const { error: refError } = await admin.from("referrals").insert({
          referral_code_id: referrer.id,
          referrer_user_id: referrer.user_id,
          referred_email: referredEmail ?? null,
          referred_user_id: referredUserId ?? null,
          status: "signed_up",
        });

        if (refError) {
          console.error("[referral/track] Failed to create referral:", refError);
          return NextResponse.json({ error: "Failed to track referral" }, { status: 500 });
        }
        break;
      }

      case "qualified": {
        if (!referredUserId) {
          return NextResponse.json({ error: "referredUserId required for qualified event" }, { status: 400 });
        }

        // Update referral status
        const { error: updateError } = await admin
          .from("referrals")
          .update({ status: "qualified" })
          .eq("referred_user_id", referredUserId)
          .eq("referrer_user_id", referrer.user_id);

        if (updateError) {
          console.error("[referral/track] Failed to update referral:", updateError);
          return NextResponse.json({ error: "Failed to update referral" }, { status: 500 });
        }

        // TODO: Trigger reward logic based on referrer's reward tier
        break;
      }
    }

    return NextResponse.json({ success: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[referral/track] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
