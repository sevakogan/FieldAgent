export interface PaymentFailedData {
  readonly recipientName: string;
  readonly amount: number; // in cents
  readonly failureDate: string;
  readonly failureReason: string;
  readonly invoiceId?: string;
  readonly retryUrl: string;
  readonly businessName: string;
}

export function generatePaymentFailedHtml(data: PaymentFailedData): string {
  const formattedAmount = (data.amount / 100).toFixed(2);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Failed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">KleanHQ</h1>
              <p style="margin: 8px 0 0; color: #94a3b8; font-size: 14px;">Payment Notification</p>
            </td>
          </tr>

          <!-- Alert Icon -->
          <tr>
            <td style="padding: 32px 32px 0; text-align: center;">
              <div style="display: inline-block; background-color: #fef2f2; border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 32px; color: #dc2626;">
                !
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 24px 32px 32px;">
              <h2 style="margin: 0 0 8px; color: #dc2626; font-size: 20px; font-weight: 700; text-align: center;">
                Payment Failed
              </h2>
              <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px; text-align: center;">
                Hi ${escapeHtml(data.recipientName)}, we were unable to process your payment.
              </p>

              <!-- Failure Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border-radius: 8px; border: 1px solid #fecaca; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 13px; padding-bottom: 8px;">Amount</td>
                        <td style="color: #0f172a; font-size: 16px; font-weight: 700; text-align: right; padding-bottom: 8px;">$${formattedAmount}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 13px; padding-bottom: 8px;">Date</td>
                        <td style="color: #374151; font-size: 13px; text-align: right; padding-bottom: 8px;">${escapeHtml(data.failureDate)}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 13px;">Reason</td>
                        <td style="color: #dc2626; font-size: 13px; text-align: right;">${escapeHtml(data.failureReason)}</td>
                      </tr>
                      ${data.invoiceId ? `
                      <tr>
                        <td style="color: #6b7280; font-size: 13px; padding-top: 8px;">Invoice</td>
                        <td style="color: #374151; font-size: 13px; text-align: right; padding-top: 8px; font-family: monospace;">${escapeHtml(data.invoiceId)}</td>
                      </tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What to do -->
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px; color: #374151; font-size: 14px; font-weight: 600;">What you can do:</h3>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #6b7280; font-size: 13px; line-height: 1.8;">
                  <li>Verify your payment method is up to date</li>
                  <li>Ensure sufficient funds are available</li>
                  <li>Contact your bank if the issue persists</li>
                  <li>Try again using the button below</li>
                </ul>
              </div>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(data.retryUrl)}" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Retry Payment
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                If you continue to experience issues, please contact ${escapeHtml(data.businessName)} for assistance.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Powered by KleanHQ
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] ?? char);
}
