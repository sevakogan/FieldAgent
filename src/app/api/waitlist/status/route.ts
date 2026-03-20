import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Email query parameter is required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("waitlist")
      .select("position, referral_count, referral_code")
      .eq("email", email)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Email not found on waitlist." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      position: data.position,
      referralCount: data.referral_count,
      referralCode: data.referral_code,
    });
  } catch (error) {
    console.error("Waitlist status error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
