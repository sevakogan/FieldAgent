export interface WelcomeEmailData {
  readonly email: string;
  readonly fullName: string;
  readonly role: "company" | "client" | "worker";
}

export function welcomeEmailHtml({ email, fullName, role }: WelcomeEmailData): string {
  const firstName = fullName.split(" ")[0] || "there";

  const nextSteps: Record<string, string> = {
    company: `
      <ol style="color:#1d1d1f;font-size:15px;line-height:1.8;margin:0 0 24px;padding-left:20px;">
        <li>Set up your services &amp; pricing</li>
        <li>Invite your team members</li>
        <li>Add your first client</li>
      </ol>`,
    client: `
      <ol style="color:#1d1d1f;font-size:15px;line-height:1.8;margin:0 0 24px;padding-left:20px;">
        <li>Review your service schedule</li>
        <li>Set up payment method</li>
        <li>Explore your client portal</li>
      </ol>`,
    worker: `
      <ol style="color:#1d1d1f;font-size:15px;line-height:1.8;margin:0 0 24px;padding-left:20px;">
        <li>Complete your profile</li>
        <li>Check your upcoming schedule</li>
        <li>Download the mobile app</li>
      </ol>`,
  };

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;">
    <div style="background:#1d1d1f;padding:40px 32px;text-align:center;">
      <h1 style="color:#fff;font-size:28px;font-weight:800;margin:0;">Welcome to KleanHQ</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#1d1d1f;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Hey ${firstName}! Your account (<strong>${email}</strong>) is ready to go.
      </p>
      <p style="color:#1d1d1f;font-size:16px;line-height:1.6;margin:0 0 24px;">
        Here's what to do next:
      </p>
      ${nextSteps[role] ?? nextSteps.company}
      <div style="text-align:center;margin:32px 0;">
        <a href="https://kleanhq.com/dashboard"
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
        &copy; ${new Date().getFullYear()} TheLevelTeam LLC &middot; KleanHQ
      </p>
    </div>
  </div>
</body>
</html>`.trim();
}
