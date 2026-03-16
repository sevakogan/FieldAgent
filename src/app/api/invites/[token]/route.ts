import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: invite, error } = await admin
    .from("invites")
    .select("*, companies(name)")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (error || !invite) {
    return NextResponse.json({ error: "Invalid or expired invite" }, { status: 404 });
  }

  if (new Date(invite.expires_at) < new Date()) {
    await admin.from("invites").update({ status: "expired" }).eq("id", invite.id);
    return NextResponse.json({ error: "Invite has expired" }, { status: 410 });
  }

  return NextResponse.json({
    role: invite.role,
    companyName: invite.companies?.name || "Unknown",
    email: invite.email,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Must be signed in to accept invite" }, { status: 401 });
  }

  const { data: invite } = await admin
    .from("invites")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (!invite) {
    return NextResponse.json({ error: "Invalid or expired invite" }, { status: 404 });
  }

  const body = await request.json();
  const { fullName, phone } = body;

  const { error: profileError } = await admin
    .from("profiles")
    .insert({
      id: user.id,
      company_id: invite.company_id,
      role: invite.role,
      full_name: fullName || user.email || "",
      phone: phone || "",
    });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  await admin.from("invites").update({ status: "accepted" }).eq("id", invite.id);

  return NextResponse.json({ success: true, role: invite.role });
}
