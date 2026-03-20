import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FeedbackType } from "@/types/database";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    type?: FeedbackType;
    title?: string;
    description?: string;
    page?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, title, description, page } = body;

  if (!type || !title || !description) {
    return NextResponse.json(
      { error: "type, title, and description are required" },
      { status: 400 },
    );
  }

  const validTypes: FeedbackType[] = ["bug", "feature_request", "general"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid feedback type" }, { status: 400 });
  }

  if (title.length > 200) {
    return NextResponse.json({ error: "Title too long (max 200 characters)" }, { status: 400 });
  }

  if (description.length > 5000) {
    return NextResponse.json({ error: "Description too long (max 5000 characters)" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: feedback, error: insertError } = await admin
    .from("feedback")
    .insert({
      user_id: user.id,
      type,
      title: title.trim(),
      description: description.trim(),
      page: page?.trim() ?? null,
      status: "new",
      votes: 0,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[feedback/submit] Insert failed:", insertError);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }

  return NextResponse.json({ success: true, feedbackId: feedback.id });
}
