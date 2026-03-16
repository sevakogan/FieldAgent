import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "owner") {
    return NextResponse.json({ error: "Only owners can send invites" }, { status: 403 });
  }

  const body = await request.json();
  const { email, phone, role, name } = body;

  if (!role || !["crew", "client"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  if (!email && !phone) {
    return NextResponse.json({ error: "Email or phone is required" }, { status: 400 });
  }

  const { data: invite, error: inviteError } = await supabase
    .from("invites")
    .insert({
      company_id: profile.company_id,
      email: email || null,
      phone: phone || null,
      role,
      invited_by: user.id,
    })
    .select()
    .single();

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  // If email provided, send Supabase invite email
  if (email) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    await admin.auth.admin.inviteUserByEmail(email, {
      data: { invite_token: invite.token, full_name: name || "" },
      redirectTo: `${request.headers.get("origin") || ""}/invite/${invite.token}`,
    });
  }

  return NextResponse.json({
    success: true,
    invite: {
      id: invite.id,
      token: invite.token,
      role: invite.role,
    },
  });
}
