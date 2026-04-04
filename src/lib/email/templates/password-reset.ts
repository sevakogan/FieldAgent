import { baseEmailHtml, primaryButton, bodyText, mutedText } from './base'

export function passwordResetEmailHtml({ email, link }: { readonly email: string; readonly link: string }): string {
  const body = `
    ${bodyText('We received a request to reset the password for your KleanHQ account.')}
    ${bodyText(`Click the button below to set a new password for <strong>${email}</strong>. This link expires in 1 hour.`)}
    ${primaryButton(link, 'Reset Password')}
    ${mutedText('If you didn\'t request a password reset, you can safely ignore this email — your password won\'t change.')}
    <div style="margin-top:24px;padding:16px;background:#f5f5f7;border-radius:12px;">
      <p style="color:#86868b;font-size:12px;margin:0;word-break:break-all;">
        Or copy and paste this URL into your browser:<br>
        <span style="color:#1d1d1f;">${link}</span>
      </p>
    </div>
  `
  return baseEmailHtml({
    title: 'Reset your KleanHQ password',
    previewText: 'Reset your KleanHQ password — link valid for 1 hour.',
    body,
  })
}
