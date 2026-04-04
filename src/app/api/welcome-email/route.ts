import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmailHtml } from "@/lib/email/templates/welcome";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, fullName, role } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const html = welcomeEmailHtml({
      email,
      fullName: fullName || email.split("@")[0],
      role: role || "company",
    });

    const result = await sendEmail({
      to: email,
      subject: "Welcome to KleanHQ — let's get you set up",
      html,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (err) {
    console.error("[welcome-email] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 }
    );
  }
}
