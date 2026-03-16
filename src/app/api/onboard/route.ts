import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { companyName, fullName, phone } = body;

  if (!companyName || !fullName) {
    return NextResponse.json({ error: "Company name and full name are required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Check if user already has a profile
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Profile already exists" }, { status: 409 });
  }

  // Create company
  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert({ name: companyName, owner_id: user.id, phone: phone || "" })
    .select()
    .single();

  if (companyError) {
    return NextResponse.json({ error: companyError.message }, { status: 500 });
  }

  // Create profile
  const { error: profileError } = await admin
    .from("profiles")
    .insert({
      id: user.id,
      company_id: company.id,
      role: "owner",
      full_name: fullName,
      phone: phone || "",
    });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, companyId: company.id });
}
