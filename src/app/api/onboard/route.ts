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

  // Check if user already has a profile with a company
  const { data: existing } = await admin
    .from("profiles")
    .select("id, company_id")
    .eq("id", user.id)
    .single();

  let companyId: string;

  if (existing?.company_id) {
    // Already onboarded — update existing records
    const { error: companyError } = await admin
      .from("companies")
      .update({ name: companyName, phone: phone || "" })
      .eq("id", existing.company_id);

    if (companyError) {
      return NextResponse.json({ error: companyError.message }, { status: 500 });
    }

    const { error: profileError } = await admin
      .from("profiles")
      .update({ full_name: fullName, phone: phone || "" })
      .eq("id", user.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    companyId = existing.company_id;
  } else {
    // Create company
    const { data: company, error: companyError } = await admin
      .from("companies")
      .insert({ name: companyName, owner_id: user.id, phone: phone || "" })
      .select()
      .single();

    if (companyError) {
      return NextResponse.json({ error: companyError.message }, { status: 500 });
    }

    if (existing) {
      // Profile row exists but no company — update it
      const { error: profileError } = await admin
        .from("profiles")
        .update({
          company_id: company.id,
          role: "owner",
          full_name: fullName,
          phone: phone || "",
        })
        .eq("id", user.id);

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }
    } else {
      // No profile at all — insert
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
    }

    companyId = company.id;
  }

  return NextResponse.json({ success: true, companyId });
}
