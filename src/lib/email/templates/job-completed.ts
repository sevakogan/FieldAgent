export interface JobCompletedEmailData {
  readonly clientName: string;
  readonly service: string;
  readonly address: string;
  readonly completedAt: string;
  readonly workerName?: string;
  readonly amount?: number;
  readonly companyName: string;
  readonly reviewUrl?: string;
}

export function jobCompletedEmailHtml({
  clientName,
  service,
  address,
  completedAt,
  workerName,
  amount,
  companyName,
  reviewUrl,
}: JobCompletedEmailData): string {
  const firstName = clientName.split(" ")[0] || "there";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;">
    <div style="background:#1d1d1f;padding:40px 32px;text-align:center;">
      <h1 style="color:#fff;font-size:24px;font-weight:800;margin:0;">Job Completed</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#1d1d1f;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Hi ${firstName}, your ${service} has been completed!
      </p>
      <div style="background:#f5f5f7;border-radius:12px;padding:20px;margin:0 0 24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#86868b;font-size:13px;padding:4px 0;">Service</td>
            <td style="color:#1d1d1f;font-size:14px;font-weight:600;text-align:right;padding:4px 0;">${service}</td>
          </tr>
          <tr>
            <td style="color:#86868b;font-size:13px;padding:4px 0;">Location</td>
            <td style="color:#1d1d1f;font-size:14px;font-weight:600;text-align:right;padding:4px 0;">${address}</td>
          </tr>
          <tr>
            <td style="color:#86868b;font-size:13px;padding:4px 0;">Completed</td>
            <td style="color:#1d1d1f;font-size:14px;font-weight:600;text-align:right;padding:4px 0;">${completedAt}</td>
          </tr>
          ${workerName ? `
          <tr>
            <td style="color:#86868b;font-size:13px;padding:4px 0;">Technician</td>
            <td style="color:#1d1d1f;font-size:14px;font-weight:600;text-align:right;padding:4px 0;">${workerName}</td>
          </tr>` : ""}
          ${amount !== undefined ? `
          <tr>
            <td style="color:#86868b;font-size:13px;padding:8px 0 0;border-top:1px solid #e5e5e7;">Total</td>
            <td style="color:#1d1d1f;font-size:16px;font-weight:700;text-align:right;padding:8px 0 0;border-top:1px solid #e5e5e7;">$${amount.toFixed(2)}</td>
          </tr>` : ""}
        </table>
      </div>
      ${reviewUrl ? `
      <div style="text-align:center;margin:24px 0;">
        <a href="${reviewUrl}"
           style="background:#0071e3;color:#fff;text-decoration:none;padding:14px 32px;border-radius:980px;font-weight:600;font-size:16px;display:inline-block;">
          Leave a Review
        </a>
      </div>` : ""}
      <p style="color:#86868b;font-size:13px;line-height:1.5;margin:0;text-align:center;">
        Thank you for choosing ${companyName}!
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
