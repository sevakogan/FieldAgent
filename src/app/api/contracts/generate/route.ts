import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateContract } from "@/lib/ai/contracts";
import type { ContractInput } from "@/lib/ai/contracts";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    clientId?: string;
    addressId?: string;
    serviceIds?: string[];
    startDate?: string;
    endDate?: string;
    additionalTerms?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { clientId, addressId, serviceIds, startDate, additionalTerms } = body;

  if (!clientId || !startDate) {
    return NextResponse.json({ error: "clientId and startDate are required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch company
  const { data: profile } = await admin
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  const { data: company } = await admin
    .from("companies")
    .select("name, cancellation_policy_hours, late_cancel_fee")
    .eq("id", profile.company_id)
    .single();

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  // Fetch client
  const { data: client } = await admin
    .from("clients")
    .select("user_id")
    .eq("id", clientId)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const { data: clientProfile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", client.user_id)
    .single();

  // Fetch address
  let address = "On-site";
  if (addressId) {
    const { data: addr } = await admin
      .from("addresses")
      .select("street, city, state, zip")
      .eq("id", addressId)
      .single();
    if (addr) {
      address = `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`;
    }
  }

  // Fetch services
  const services: { name: string; price: number; recurrence: string }[] = [];
  if (serviceIds?.length) {
    const { data: svcData } = await admin
      .from("company_services")
      .select("name, default_price")
      .in("id", serviceIds);

    for (const svc of svcData ?? []) {
      services.push({
        name: svc.name,
        price: svc.default_price,
        recurrence: "per service",
      });
    }
  }

  const contractInput: ContractInput = {
    companyName: company.name,
    clientName: clientProfile?.full_name ?? "Client",
    services,
    address,
    startDate,
    endDate: body.endDate,
    cancellationPolicyHours: company.cancellation_policy_hours,
    lateCancelFee: company.late_cancel_fee,
    paymentTerms: "Due upon completion unless otherwise arranged",
    additionalTerms,
  };

  const result = await generateContract(contractInput);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  // Store the contract
  const { data: contract, error: insertError } = await admin
    .from("contracts")
    .insert({
      company_id: profile.company_id,
      client_id: clientId,
      title: result.contract!.title,
      content: result.contract!.content,
      status: "draft",
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[contracts/generate] Failed to store contract:", insertError);
    return NextResponse.json({ error: "Failed to save contract" }, { status: 500 });
  }

  return NextResponse.json({
    contractId: contract.id,
    title: result.contract!.title,
    content: result.contract!.content,
  });
}
