import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBusinessConfig } from "@/lib/service-catalog";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { companyName, fullName, phone, businessType = "lawn_care" } = body;

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
      .update({ name: companyName, phone: phone || "", business_type: businessType })
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
      .insert({ name: companyName, owner_id: user.id, phone: phone || "", business_type: businessType })
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

  // Seed company_services from the business type catalog
  const config = getBusinessConfig(businessType);
  const servicesToInsert = config.services.map((s, i) => ({
    company_id: companyId,
    name: s.name,
    default_price: s.defaultPrice,
    category: s.category,
    sort_order: i,
  }));

  // Delete existing services first (safe for both new and updated companies)
  const { error: deleteError } = await admin
    .from("company_services")
    .delete()
    .eq("company_id", companyId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const { error: seedError } = await admin
    .from("company_services")
    .insert(servicesToInsert);

  if (seedError) {
    return NextResponse.json({ error: seedError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, companyId });
}
