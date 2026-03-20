import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { count, error } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Waitlist count error:", error);
      return NextResponse.json({ total: 0 });
    }

    return NextResponse.json(
      { total: count ?? 0 },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Waitlist count error:", error);
    return NextResponse.json({ total: 0 });
  }
}
