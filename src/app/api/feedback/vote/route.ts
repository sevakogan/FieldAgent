import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { feedbackId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { feedbackId } = body;

  if (!feedbackId) {
    return NextResponse.json({ error: "feedbackId is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Check if already voted
  const { data: existingVote } = await admin
    .from("feedback_votes")
    .select("id")
    .eq("feedback_id", feedbackId)
    .eq("user_id", user.id)
    .single();

  if (existingVote) {
    // Remove vote (toggle)
    await admin
      .from("feedback_votes")
      .delete()
      .eq("id", existingVote.id);

    // Decrement vote count
    const { data: feedback } = await admin
      .from("feedback")
      .select("votes")
      .eq("id", feedbackId)
      .single();

    const newVotes = Math.max(0, (feedback?.votes ?? 1) - 1);
    await admin
      .from("feedback")
      .update({ votes: newVotes })
      .eq("id", feedbackId);

    return NextResponse.json({ voted: false, votes: newVotes });
  }

  // Add vote
  const { error: voteError } = await admin
    .from("feedback_votes")
    .insert({
      feedback_id: feedbackId,
      user_id: user.id,
    });

  if (voteError) {
    console.error("[feedback/vote] Vote failed:", voteError);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }

  // Increment vote count
  const { data: feedback } = await admin
    .from("feedback")
    .select("votes")
    .eq("id", feedbackId)
    .single();

  const newVotes = (feedback?.votes ?? 0) + 1;
  await admin
    .from("feedback")
    .update({ votes: newVotes })
    .eq("id", feedbackId);

  return NextResponse.json({ voted: true, votes: newVotes });
}
