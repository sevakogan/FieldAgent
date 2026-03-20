import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTurnstile } from "@/lib/utils/turnstile";
import { generateReferralCode, calculatePositions } from "@/lib/utils/referral";
import { sendWaitlistConfirmation } from "@/lib/email/waitlist-confirmation";

const TYPE_MAP: Record<string, string> = {
  Company: "company",
  Client: "client",
  Reseller: "reseller",
  Pro: "independent_pro",
};

interface SignupBody {
  readonly name?: string;
  readonly email?: string;
  readonly type?: string;
  readonly referralCode?: string;
  readonly turnstileToken?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupBody = await request.json();

    // Validate inputs
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const type = body.type;
    const referralCode = body.referralCode?.trim() || undefined;
    const turnstileToken = body.turnstileToken?.trim() || "";

    if (!name || name.length < 1) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "A valid email is required." },
        { status: 400 }
      );
    }

    const dbType = type ? TYPE_MAP[type] : undefined;
    if (!type || !dbType) {
      return NextResponse.json(
        { error: "Type must be Company, Client, Reseller, or Pro." },
        { status: 400 }
      );
    }

    // Verify turnstile (skip if no secret key configured)
    if (process.env.TURNSTILE_SECRET_KEY) {
      const turnstileValid = await verifyTurnstile(turnstileToken);
      if (!turnstileValid) {
        return NextResponse.json(
          { error: "Bot verification failed. Please try again." },
          { status: 400 }
        );
      }
    }

    const supabase = createAdminClient();

    // Check for duplicate email
    const { data: existing } = await supabase
      .from("waitlist")
      .select("id, position, referral_code")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({
        position: existing.position,
        referralCode: existing.referral_code,
        referralLink: `https://kleanhq.com/r/${existing.referral_code}`,
        alreadyRegistered: true,
      });
    }

    // Generate referral code
    const newReferralCode = generateReferralCode();

    // Look up referrer if referral code provided
    let referredById: string | null = null;
    let referredByName: string | null = null;

    if (referralCode) {
      const { data: referrer } = await supabase
        .from("waitlist")
        .select("id, full_name")
        .eq("referral_code", referralCode)
        .single();

      if (referrer) {
        referredById = referrer.id;
        referredByName = referrer.full_name;
      }
    }

    // Insert new waitlist entry
    const { data: newEntry, error: insertError } = await supabase
      .from("waitlist")
      .insert({
        full_name: name,
        email,
        type: dbType,
        referral_code: newReferralCode,
        referred_by: referredById,
        referral_count: 0,
      })
      .select("id, created_at")
      .single();

    if (insertError || !newEntry) {
      console.error("Waitlist insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to join waitlist. Please try again." },
        { status: 500 }
      );
    }

    // If referred, increment referrer's referral_count
    if (referredById) {
      const { data: referrer } = await supabase
        .from("waitlist")
        .select("referral_count")
        .eq("id", referredById)
        .single();

      await supabase
        .from("waitlist")
        .update({ referral_count: (referrer?.referral_count ?? 0) + 1 })
        .eq("id", referredById);
    }

    // Recalculate positions for all entries
    const { data: allEntries } = await supabase
      .from("waitlist")
      .select("id, referral_count, created_at")
      .order("created_at", { ascending: true });

    if (allEntries && allEntries.length > 0) {
      const positions = calculatePositions(allEntries);

      // Batch update positions
      for (const entry of positions) {
        await supabase
          .from("waitlist")
          .update({ position: entry.position })
          .eq("id", entry.id);
      }
    }

    // Get the new entry's final position
    const { data: updated } = await supabase
      .from("waitlist")
      .select("position")
      .eq("id", newEntry.id)
      .single();

    const finalPosition = updated?.position ?? allEntries?.length ?? 1;

    // Send confirmation email (fire and forget)
    sendWaitlistConfirmation(email, name, finalPosition, newReferralCode).catch(
      (err) => console.error("Email send error:", err)
    );

    return NextResponse.json({
      position: finalPosition,
      referralCode: newReferralCode,
      referralLink: `https://kleanhq.com/r/${newReferralCode}`,
      ...(referredByName ? { referredBy: referredByName } : {}),
    });
  } catch (error) {
    console.error("Waitlist signup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
