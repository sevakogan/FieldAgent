import { baseEmailHtml, primaryButton, bodyText, mutedText } from './base'

export function magicLinkEmailHtml({ email, link }: { readonly email: string; readonly link: string }): string {
  const body = `
    ${bodyText('You requested a sign-in link for your KleanHQ account.')}
    ${bodyText(`Click the button below to sign in as <strong>${email}</strong>. This link expires in 1 hour.`)}
    ${primaryButton(link, 'Sign In to KleanHQ')}
    ${mutedText('If you didn\'t request this link, you can safely ignore this email.')}
    <div style="margin-top:24px;padding:16px;background:#f5f5f7;border-radius:12px;">
      <p style="color:#86868b;font-size:12px;margin:0;word-break:break-all;">
        Or copy and paste this URL into your browser:<br>
        <span style="color:#1d1d1f;">${link}</span>
      </p>
    </div>
  `
  return baseEmailHtml({
    title: 'Sign in to KleanHQ',
    previewText: 'Your KleanHQ sign-in link — valid for 1 hour.',
    body,
  })
}
