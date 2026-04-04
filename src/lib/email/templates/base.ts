/**
 * Shared KleanHQ email shell — all transactional emails use this layout.
 */
export function baseEmailHtml({
  title,
  previewText,
  body,
}: {
  readonly title: string
  readonly previewText: string
  readonly body: string
}): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <!-- Preview text (hidden) -->
  <span style="display:none;max-height:0;overflow:hidden;">${previewText}</span>

  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    <!-- Header -->
    <div style="background:#1d1d1f;padding:32px;text-align:center;">
      <h1 style="color:#fff;font-size:24px;font-weight:800;margin:0;letter-spacing:-0.5px;">KleanHQ</h1>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      ${body}
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #f0f0f0;padding:20px 32px;text-align:center;">
      <p style="color:#86868b;font-size:12px;margin:0;line-height:1.6;">
        &copy; ${new Date().getFullYear()} TheLevelTeam LLC &middot; KleanHQ<br>
        Questions? Reply to this email — we read every one.
      </p>
    </div>
  </div>
</body>
</html>`.trim()
}

export function primaryButton(href: string, label: string): string {
  return `<div style="text-align:center;margin:32px 0;">
    <a href="${href}"
       style="background:#0071e3;color:#fff;text-decoration:none;padding:14px 36px;border-radius:980px;font-weight:600;font-size:16px;display:inline-block;">
      ${label}
    </a>
  </div>`
}

export function bodyText(text: string): string {
  return `<p style="color:#1d1d1f;font-size:16px;line-height:1.6;margin:0 0 16px;">${text}</p>`
}

export function mutedText(text: string): string {
  return `<p style="color:#86868b;font-size:13px;line-height:1.6;margin:0;">${text}</p>`
}
