import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types/database";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";

interface ChatMessage {
  readonly role: "user" | "assistant";
  readonly content: string;
}

interface ChatResponse {
  readonly success: boolean;
  readonly message?: string;
  readonly conversationId?: string;
  readonly error?: string;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  owner: `You are KleanHQ Assistant, an AI helper for cleaning and field service business owners. You help with:
- Scheduling and job management questions
- Client communication best practices
- Pricing strategy and estimates
- Team management and worker coordination
- Business growth tips specific to cleaning/field services
Keep responses concise, actionable, and professional. Never make up data — if unsure, say so.`,

  worker: `You are KleanHQ Assistant, helping field service workers. You help with:
- Understanding job details and checklists
- Best practices for completing services
- Communication with clients on-site
- Reporting issues or requesting schedule changes
Keep responses brief and practical. Focus on getting the job done well.`,

  client: `You are KleanHQ Assistant, helping clients manage their services. You help with:
- Scheduling and rescheduling services
- Understanding invoices and payments
- Communicating with your service provider
- Requesting new services or quotes
Keep responses friendly, clear, and helpful.`,

  lead: `You are KleanHQ Assistant, helping team leads coordinate field operations. You help with:
- Assigning and managing worker schedules
- Quality control and job review
- Client relationship management
- Operational efficiency tips
Keep responses focused and actionable.`,

  default: `You are KleanHQ Assistant, a helpful AI for cleaning and field service management. Answer questions clearly and concisely.`,
};

function getSystemPrompt(role: UserRole): string {
  return SYSTEM_PROMPTS[role] ?? SYSTEM_PROMPTS.default;
}

export async function chat(
  userId: string,
  role: UserRole,
  message: string,
  conversationId?: string,
): Promise<ChatResponse> {
  if (!ANTHROPIC_API_KEY) {
    return { success: false, error: "ANTHROPIC_API_KEY not configured" };
  }

  if (!message.trim()) {
    return { success: false, error: "Message cannot be empty" };
  }

  const admin = createAdminClient();

  // Get or create conversation
  let activeConversationId = conversationId;
  if (!activeConversationId) {
    const { data: conv, error } = await admin
      .from("ai_conversations")
      .insert({
        user_id: userId,
        title: message.slice(0, 100),
      })
      .select("id")
      .single();

    if (error || !conv) {
      console.error("[ai] Failed to create conversation:", error);
      return { success: false, error: "Failed to create conversation" };
    }
    activeConversationId = conv.id;
  }

  // Fetch conversation history
  const { data: history } = await admin
    .from("ai_messages")
    .select("role, content")
    .eq("conversation_id", activeConversationId)
    .order("created_at", { ascending: true })
    .limit(50);

  const messages: ChatMessage[] = [
    ...(history ?? []).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: message },
  ];

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        system: getSystemPrompt(role),
        messages,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[ai] API error:", text);
      return { success: false, error: "AI service unavailable" };
    }

    const data = await response.json();
    const assistantMessage =
      data.content?.[0]?.type === "text" ? data.content[0].text : "I couldn't generate a response.";

    // Store both messages
    await admin.from("ai_messages").insert([
      { conversation_id: activeConversationId, role: "user", content: message },
      { conversation_id: activeConversationId, role: "assistant", content: assistantMessage },
    ]);

    return {
      success: true,
      message: assistantMessage,
      conversationId: activeConversationId,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[ai] Chat error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function getConversations(
  userId: string,
): Promise<{ readonly id: string; readonly title: string; readonly updatedAt: string }[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("ai_conversations")
    .select("id, title, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[ai] Failed to fetch conversations:", error);
    return [];
  }

  return (data ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    updatedAt: c.updated_at,
  }));
}

export async function getConversationMessages(
  conversationId: string,
  userId: string,
): Promise<ChatMessage[]> {
  const admin = createAdminClient();

  // Verify ownership
  const { data: conv } = await admin
    .from("ai_conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .single();

  if (!conv) return [];

  const { data, error } = await admin
    .from("ai_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[ai] Failed to fetch messages:", error);
    return [];
  }

  return (data ?? []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
}
