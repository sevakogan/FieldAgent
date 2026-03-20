export interface InvoiceEmailData {
  readonly recipientName: string;
  readonly invoiceNumber: string;
  readonly amountDue: number; // in cents
  readonly dueDate: string;
  readonly lineItems: ReadonlyArray<{
    readonly description: string;
    readonly amount: number; // in cents
  }>;
  readonly hostedInvoiceUrl: string;
  readonly businessName: string;
}

export function generateInvoiceEmailHtml(data: InvoiceEmailData): string {
  const formattedAmount = (data.amountDue / 100).toFixed(2);

  const lineItemsHtml = data.lineItems
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px;">
            ${escapeHtml(item.description)}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px; text-align: right;">
            $${(item.amount / 100).toFixed(2)}
          </td>
        </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${escapeHtml(data.invoiceNumber)}</title>
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
              <p style="margin: 8px 0 0; color: #94a3b8; font-size: 14px;">Invoice</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Hi ${escapeHtml(data.recipientName)},</p>
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px;">
                Here is your invoice from <strong>${escapeHtml(data.businessName)}</strong>.
              </p>

              <!-- Invoice Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 13px; padding-bottom: 4px;">Invoice Number</td>
                        <td style="color: #374151; font-size: 13px; text-align: right; padding-bottom: 4px;">${escapeHtml(data.invoiceNumber)}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 13px; padding-bottom: 4px;">Due Date</td>
                        <td style="color: #374151; font-size: 13px; text-align: right; padding-bottom: 4px;">${escapeHtml(data.dueDate)}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 13px; font-weight: 600;">Amount Due</td>
                        <td style="color: #0f172a; font-size: 16px; font-weight: 700; text-align: right;">$${formattedAmount}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Line Items -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <th style="padding: 12px 16px; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 12px; text-transform: uppercase; text-align: left;">Description</th>
                  <th style="padding: 12px 16px; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 12px; text-transform: uppercase; text-align: right;">Amount</th>
                </tr>
                ${lineItemsHtml}
                <tr>
                  <td style="padding: 12px 16px; color: #0f172a; font-size: 14px; font-weight: 700;">Total</td>
                  <td style="padding: 12px 16px; color: #0f172a; font-size: 16px; font-weight: 700; text-align: right;">$${formattedAmount}</td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(data.hostedInvoiceUrl)}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Pay Invoice
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                This invoice was sent by KleanHQ on behalf of ${escapeHtml(data.businessName)}.
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
