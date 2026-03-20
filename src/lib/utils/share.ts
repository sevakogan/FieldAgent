const BASE_URL = "https://kleanhq.com";

function buildReferralUrl(code: string): string {
  return `${BASE_URL}/r/${code}`;
}

const SHARE_MESSAGE = (code: string) =>
  `I just signed up for KleanHQ — the easiest way to run a service business. Join the waitlist and skip the line: ${buildReferralUrl(code)}`;

/**
 * Returns an sms: link with a pre-filled referral message.
 */
export function getSMSLink(code: string): string {
  const message = encodeURIComponent(SHARE_MESSAGE(code));
  return `sms:?&body=${message}`;
}

/**
 * Returns a mailto: link with subject and a rich multi-line body for email sharing.
 */
export function getEmailLink(code: string): string {
  const subject = encodeURIComponent(
    "You need to see this — KleanHQ is launching"
  );
  const body = encodeURIComponent(
    `Hey!\n\nI just signed up for KleanHQ — it's a new app for managing field service businesses (lawn care, pool service, cleaning, etc.)\n\nThey have a referral waitlist where you can skip the line. Use my link:\n\n${buildReferralUrl(code)}\n\nFeatures include AI scheduling, automatic payments, GPS tracking, and a marketplace to find pros.\n\nLaunching June 1, 2026!`
  );
  return `mailto:?subject=${subject}&body=${body}`;
}

/**
 * Returns a WhatsApp share link with a pre-filled referral message.
 */
export function getWhatsAppLink(code: string): string {
  const message = encodeURIComponent(SHARE_MESSAGE(code));
  return `https://wa.me/?text=${message}`;
}

/**
 * Returns the plain referral URL for copying to clipboard.
 */
export function getCopyLink(code: string): string {
  return buildReferralUrl(code);
}
