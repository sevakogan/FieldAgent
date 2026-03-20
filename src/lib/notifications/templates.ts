import type { NotificationType, NotificationData } from "@/lib/notifications/send";

export interface NotificationTemplate {
  readonly title: string;
  readonly body: string;
  readonly emailHtml?: string;
}

function wrap(title: string, body: string): NotificationTemplate {
  return {
    title,
    body,
    emailHtml: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <h2 style="color:#1d1d1f;font-size:20px;margin:0 0 12px;">${title}</h2>
        <p style="color:#424245;font-size:15px;line-height:1.6;margin:0;">${body}</p>
        <hr style="border:none;border-top:1px solid #e5e5e7;margin:24px 0;" />
        <p style="color:#86868b;font-size:12px;margin:0;">KleanHQ Notifications</p>
      </div>
    `.trim(),
  };
}

const templateGenerators: Record<NotificationType, (data: NotificationData) => NotificationTemplate> = {
  job_assigned: (data) =>
    wrap(
      "New Job Assigned",
      `You've been assigned a ${data.service ?? "job"} on ${data.date ?? "an upcoming date"}${data.address ? ` at ${data.address}` : ""}.`,
    ),

  job_completed: (data) =>
    wrap(
      "Job Completed",
      `The ${data.service ?? "job"} at ${data.address ?? "your property"} has been completed.${data.workerName ? ` Completed by ${data.workerName}.` : ""}`,
    ),

  job_cancelled: (data) =>
    wrap(
      "Job Cancelled",
      `The ${data.service ?? "job"} scheduled for ${data.date ?? "an upcoming date"} has been cancelled.${data.reason ? ` Reason: ${data.reason}` : ""}`,
    ),

  job_reminder: (data) =>
    wrap(
      "Job Reminder",
      `Reminder: You have a ${data.service ?? "job"} scheduled for ${data.date ?? "tomorrow"}${data.time ? ` at ${data.time}` : ""}.`,
    ),

  payment_received: (data) =>
    wrap(
      "Payment Received",
      `Payment of $${data.amount ?? "0.00"} has been received.${data.invoiceNumber ? ` Invoice #${data.invoiceNumber}.` : ""}`,
    ),

  payment_failed: (data) =>
    wrap(
      "Payment Failed",
      `Payment of $${data.amount ?? "0.00"} failed.${data.retryDate ? ` We'll retry on ${data.retryDate}.` : " Please update your payment method."}`,
    ),

  invoice_created: (data) =>
    wrap(
      "New Invoice",
      `A new invoice for $${data.amount ?? "0.00"} has been created.${data.dueDate ? ` Due by ${data.dueDate}.` : ""}`,
    ),

  review_request: (data) =>
    wrap(
      "How did we do?",
      `We'd love your feedback on the recent ${data.service ?? "service"}.${data.reviewLink ? ` Leave a review here: ${data.reviewLink}` : ""}`,
    ),

  new_message: (data) =>
    wrap(
      "New Message",
      `${data.senderName ?? "Someone"} sent you a message${data.preview ? `: "${data.preview}"` : "."}`,
    ),

  worker_invited: (data) =>
    wrap(
      "You're Invited to Join a Team",
      `${data.companyName ?? "A company"} has invited you to join their team on KleanHQ. Accept your invite to get started.`,
    ),

  client_invited: (data) =>
    wrap(
      "You're Invited to KleanHQ",
      `${data.companyName ?? "Your service provider"} has invited you to manage your services on KleanHQ.`,
    ),

  schedule_changed: (data) =>
    wrap(
      "Schedule Updated",
      `Your ${data.service ?? "job"} has been rescheduled${data.newDate ? ` to ${data.newDate}` : ""}${data.newTime ? ` at ${data.newTime}` : ""}.`,
    ),

  weather_alert: (data) =>
    wrap(
      "Weather Alert",
      `Weather conditions may affect your ${data.service ?? "outdoor job"} on ${data.date ?? "an upcoming date"}: ${data.conditions ?? "Check forecast"}.`,
    ),
};

export function getNotificationTemplate(
  type: NotificationType,
  data: NotificationData,
): NotificationTemplate {
  const generator = templateGenerators[type];
  if (!generator) {
    return wrap("Notification", "You have a new notification from KleanHQ.");
  }
  return generator(data);
}
