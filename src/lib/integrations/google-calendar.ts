import { createAdminClient } from "@/lib/supabase/admin";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET ?? "";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_CALENDAR_REDIRECT_URI ?? "";

export interface CalendarEvent {
  readonly id?: string;
  readonly summary: string;
  readonly description: string;
  readonly start: string;
  readonly end: string;
  readonly location?: string;
}

export function getAuthUrl(userId: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.events",
    access_type: "offline",
    prompt: "consent",
    state: userId,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string,
  userId: string,
): Promise<{ readonly success: boolean; readonly error?: string }> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return { success: false, error: "Google Calendar credentials not configured" };
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[google-calendar] Token exchange failed:", text);
      return { success: false, error: "Token exchange failed" };
    }

    const data = await response.json();
    const admin = createAdminClient();

    await admin.from("user_integrations").upsert({
      user_id: userId,
      provider: "google_calendar",
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[google-calendar] OAuth error:", message);
    return { success: false, error: message };
  }
}

async function getAccessToken(userId: string): Promise<string | null> {
  const admin = createAdminClient();

  const { data: integration } = await admin
    .from("user_integrations")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .eq("provider", "google_calendar")
    .single();

  if (!integration) return null;

  // Refresh if expired
  if (new Date(integration.expires_at) < new Date()) {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: integration.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      console.error("[google-calendar] Token refresh failed");
      return null;
    }

    const data = await response.json();
    await admin.from("user_integrations").update({
      access_token: data.access_token,
      expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    }).eq("user_id", userId).eq("provider", "google_calendar");

    return data.access_token;
  }

  return integration.access_token;
}

export async function createEvent(
  userId: string,
  event: CalendarEvent,
): Promise<{ readonly success: boolean; readonly eventId?: string; readonly error?: string }> {
  const accessToken = await getAccessToken(userId);
  if (!accessToken) {
    return { success: false, error: "Google Calendar not connected" };
  }

  try {
    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: event.summary,
          description: event.description,
          start: { dateTime: event.start, timeZone: "America/Los_Angeles" },
          end: { dateTime: event.end, timeZone: "America/Los_Angeles" },
          location: event.location,
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("[google-calendar] Create event failed:", text);
      return { success: false, error: "Failed to create calendar event" };
    }

    const data = await response.json();
    return { success: true, eventId: data.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[google-calendar] Create event error:", message);
    return { success: false, error: message };
  }
}

export async function deleteEvent(
  userId: string,
  eventId: string,
): Promise<{ readonly success: boolean; readonly error?: string }> {
  const accessToken = await getAccessToken(userId);
  if (!accessToken) {
    return { success: false, error: "Google Calendar not connected" };
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok && response.status !== 404) {
      return { success: false, error: "Failed to delete calendar event" };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[google-calendar] Delete event error:", message);
    return { success: false, error: message };
  }
}

export async function syncJobToCalendar(
  userId: string,
  job: {
    readonly id: string;
    readonly service: string;
    readonly date: string;
    readonly time?: string;
    readonly address?: string;
    readonly clientName?: string;
    readonly notes?: string;
  },
): Promise<{ readonly success: boolean; readonly eventId?: string; readonly error?: string }> {
  const startTime = job.time
    ? `${job.date}T${job.time}:00`
    : `${job.date}T09:00:00`;

  const [hours, minutes] = (job.time ?? "09:00").split(":").map(Number);
  const endHour = hours + 2; // Default 2-hour duration
  const endTime = `${job.date}T${String(endHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;

  return createEvent(userId, {
    summary: `${job.service}${job.clientName ? ` — ${job.clientName}` : ""}`,
    description: [
      `Job ID: ${job.id}`,
      job.clientName ? `Client: ${job.clientName}` : "",
      job.notes ?? "",
    ].filter(Boolean).join("\n"),
    start: startTime,
    end: endTime,
    location: job.address,
  });
}
