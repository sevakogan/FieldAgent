import { Resend } from "resend";

const FROM_EMAIL = process.env.FROM_EMAIL ?? "KleanHQ <noreply@kleanhq.com>";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export interface SendEmailParams {
  readonly to: string;
  readonly subject: string;
  readonly html: string;
  readonly replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: SendEmailParams): Promise<{ readonly success: boolean; readonly id?: string; readonly error?: string }> {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping email send");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      replyTo,
    });

    if (error) {
      console.error("[email] Send failed:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[email] Unexpected error:", message);
    return { success: false, error: message };
  }
}

export async function sendBulkEmails(
  emails: readonly SendEmailParams[],
): Promise<{ readonly sent: number; readonly failed: number }> {
  let sent = 0;
  let failed = 0;

  const results = await Promise.allSettled(
    emails.map((params) => sendEmail(params)),
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
