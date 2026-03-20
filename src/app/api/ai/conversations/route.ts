import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getConversations, getConversationMessages } from "@/lib/ai/assistant";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("id");

  if (conversationId) {
    const messages = await getConversationMessages(conversationId, user.id);
    return NextResponse.json({ messages });
  }

  const conversations = await getConversations(user.id);
  return NextResponse.json({ conversations });
}
