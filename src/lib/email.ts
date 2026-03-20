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
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping email send");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[email] Send failed:", error);
    return { success: false, error: error.message };
  }

  return { success: true, id: data?.id };
}

export function welcomeEmailHtml(email: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;">
    <div style="background:#1d1d1f;padding:40px 32px;text-align:center;">
      <div style="font-size:36px;margin-bottom:12px;">🌿</div>
      <h1 style="color:#fff;font-size:28px;font-weight:800;margin:0;">Welcome to KleanHQ</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#1d1d1f;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Hey there! Your account (<strong>${email}</strong>) is ready to go.
      </p>
      <p style="color:#1d1d1f;font-size:16px;line-height:1.6;margin:0 0 24px;">
        Here's what to do next:
      </p>
      <ol style="color:#1d1d1f;font-size:15px;line-height:1.8;margin:0 0 24px;padding-left:20px;">
        <li>Choose your business type</li>
        <li>Set up your services &amp; pricing</li>
        <li>Invite your first client</li>
      </ol>
      <div style="text-align:center;margin:32px 0;">
        <a href="https://kleanhq.com/onboard"
           style="background:#0071e3;color:#fff;text-decoration:none;padding:14px 32px;border-radius:980px;font-weight:600;font-size:16px;display:inline-block;">
          Get Started
        </a>
      </div>
      <p style="color:#86868b;font-size:13px;line-height:1.5;margin:0;text-align:center;">
        Questions? Reply to this email — we read every one.
      </p>
    </div>
    <div style="border-top:1px solid #f0f0f0;padding:20px 32px;text-align:center;">
      <p style="color:#86868b;font-size:12px;margin:0;">
        © 2026 TheLevelTeam LLC · KleanHQ
      </p>
    </div>
  </div>
</body>
</html>`.trim();
}
