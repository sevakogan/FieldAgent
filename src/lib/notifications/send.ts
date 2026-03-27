import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { sendSms } from "@/lib/integrations/telnyx";
import { getNotificationTemplate } from "@/lib/notifications/templates";

export type NotificationType =
  | "job_assigned"
  | "job_completed"
  | "job_cancelled"
  | "job_reminder"
  | "payment_received"
  | "payment_failed"
  | "invoice_created"
  | "review_request"
  | "new_message"
  | "worker_invited"
  | "client_invited"
  | "schedule_changed"
  | "weather_alert";

export interface NotificationData {
  readonly [key: string]: string | number | boolean | undefined;
}

interface NotificationPreferences {
  readonly in_app: boolean;
  readonly email: boolean;
  readonly sms: boolean;
  readonly whatsapp: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  in_app: true,
  email: true,
  sms: false,
  whatsapp: false,
};

async function getUserPreferences(
  userId: string,
  notificationType: NotificationType,
): Promise<NotificationPreferences> {
  const admin = createAdminClient();

  const { data } = await admin
    .from("notification_preferences")
    .select("in_app, email, sms, whatsapp")
    .eq("user_id", userId)
    .eq("notification_type", notificationType)
    .single();

  if (!data) return DEFAULT_PREFERENCES;

  return {
    in_app: data.in_app ?? DEFAULT_PREFERENCES.in_app,
    email: data.email ?? DEFAULT_PREFERENCES.email,
    sms: data.sms ?? DEFAULT_PREFERENCES.sms,
    whatsapp: data.whatsapp ?? DEFAULT_PREFERENCES.whatsapp,
  };
}

async function getUserContact(userId: string): Promise<{
  readonly email: string | null;
  readonly phone: string | null;
  readonly fullName: string | null;
}> {
  const admin = createAdminClient();

  const { data } = await admin
    .from("profiles")
    .select("full_name, phone")
    .eq("id", userId)
    .single();

  const { data: authUser } = await admin.auth.admin.getUserById(userId);

  return {
    email: authUser?.user?.email ?? null,
    phone: data?.phone ?? null,
    fullName: data?.full_name ?? null,
  };
}

export async function sendNotification(
  userId: string,
  type: NotificationType,
  data: NotificationData,
): Promise<{ readonly success: boolean; readonly channels: readonly string[]; readonly error?: string }> {
  const admin = createAdminClient();
  const sentChannels: string[] = [];

  try {
    const [preferences, contact] = await Promise.all([
      getUserPreferences(userId, type),
      getUserContact(userId),
    ]);

    const template = getNotificationTemplate(type, data);

    // In-app notification (always attempted)
    if (preferences.in_app) {
      const { error } = await admin.from("notifications").insert({
        user_id: userId,
        type,
        title: template.title,
        body: template.body,
        data,
        read: false,
      });

      if (!error) sentChannels.push("in_app");
      else console.error("[notifications] In-app insert failed:", error);
    }

    // Email
    if (preferences.email && contact.email) {
      const result = await sendEmail({
        to: contact.email,
        subject: template.title,
        html: template.emailHtml ?? `<p>${template.body}</p>`,
      });
      if (result.success) sentChannels.push("email");
    }

    // SMS (via Telnyx)
    if (preferences.sms && contact.phone) {
      const result = await sendSms(contact.phone, `${template.title}: ${template.body}`);
      if (result.success) sentChannels.push("sms");
    }

    return { success: sentChannels.length > 0, channels: sentChannels };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[notifications] Send failed:", message);
    return { success: false, channels: sentChannels, error: message };
  }
}

export async function sendBulkNotification(
  userIds: readonly string[],
  type: NotificationType,
  data: NotificationData,
): Promise<{ readonly sent: number; readonly failed: number }> {
  let sent = 0;
  let failed = 0;

  const results = await Promise.allSettled(
    userIds.map((userId) => sendNotification(userId, type, data)),
  );

  for (const result of results) {
    if (result.status === "fulfilled" && result.value.success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}
