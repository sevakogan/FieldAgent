export interface InviteClientEmailData {
  readonly companyName: string;
  readonly inviterName: string;
  readonly inviteUrl: string;
  readonly clientEmail: string;
}

export function inviteClientEmailHtml({
  companyName,
  inviterName,
  inviteUrl,
  clientEmail,
}: InviteClientEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;">
    <div style="background:#1d1d1f;padding:40px 32px;text-align:center;">
      <h1 style="color:#fff;font-size:24px;font-weight:800;margin:0;">Manage Your Services Online</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#1d1d1f;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Hi! <strong>${inviterName}</strong> from <strong>${companyName}</strong> has set up a client portal for you on KleanHQ.
      </p>
      <p style="color:#1d1d1f;font-size:16px;line-height:1.6;margin:0 0 8px;">
        With your portal you can:
      </p>
      <ul style="color:#1d1d1f;font-size:15px;line-height:1.8;margin:0 0 24px;padding-left:20px;">
        <li>View your upcoming services</li>
        <li>Request new jobs or changes</li>
        <li>Manage payments and invoices</li>
        <li>Communicate directly with your provider</li>
      </ul>
      <div style="text-align:center;margin:32px 0;">
        <a href="${inviteUrl}"
           style="background:#0071e3;color:#fff;text-decoration:none;padding:14px 32px;border-radius:980px;font-weight:600;font-size:16px;display:inline-block;">
          Set Up Your Portal
        </a>
      </div>
      <p style="color:#86868b;font-size:13px;line-height:1.5;margin:0;text-align:center;">
        This invite was sent to ${clientEmail}. If you didn't expect this, you can ignore it.
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
