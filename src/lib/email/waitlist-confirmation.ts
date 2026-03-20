import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "KleanHQ <hello@kleanhq.com>";
const REFERRAL_BASE_URL = "https://kleanhq.com/r/";

function buildShareLinks(referralCode: string) {
  const referralUrl = `${REFERRAL_BASE_URL}${encodeURIComponent(referralCode)}`;
  const message = encodeURIComponent(
    `I just signed up for KleanHQ — the easiest way to run a service business. Join the waitlist and skip the line: ${referralUrl}`
  );
  return {
    referralUrl,
    sms: `sms:?&body=${message}`,
    whatsapp: `https://wa.me/?text=${message}`,
    email: `mailto:?subject=${encodeURIComponent("You need to see this — KleanHQ is launching")}&body=${message}`,
  };
}

function buildEmailHtml(
  name: string,
  position: number,
  referralCode: string
): string {
  const links = buildShareLinks(referralCode);
  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to KleanHQ</title>
</head>
<body style="margin:0;padding:0;background-color:#F2F2F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F2F2F7;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px;">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#007AFF 0%,#5856D6 50%,#AF52DE 100%);padding:48px 32px;text-align:center;border-radius:20px 20px 0 0;">
              <h1 style="margin:0;font-size:36px;font-weight:800;color:#ffffff;letter-spacing:-1px;">
                KleanHQ
              </h1>
              <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.85);font-weight:500;">
                The simplest field service platform
              </p>
            </td>
          </tr>

          <!-- POSITION CARD -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 32px 32px;border-left:1px solid #E5E5EA;border-right:1px solid #E5E5EA;">
              <h2 style="margin:0 0 6px;font-size:24px;font-weight:700;color:#1C1C1E;text-align:center;">
                Hey ${name}!
              </h2>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#636366;text-align:center;">
                You're officially on the waitlist. We're building something incredible and you'll be among the first to use it.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#F2F2F7 0%,#E8E8ED 100%);border-radius:20px;padding:28px 48px;border:1px solid #D1D1D6;">
                      <tr>
                        <td align="center">
                          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#8E8E93;text-transform:uppercase;letter-spacing:1.5px;">
                            Your Position
                          </p>
                          <p style="margin:0;font-size:56px;font-weight:800;color:#007AFF;line-height:1;">
                            #${position}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FEATURES GRID -->
          <tr>
            <td style="background-color:#ffffff;padding:0 32px 32px;border-left:1px solid #E5E5EA;border-right:1px solid #E5E5EA;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:20px 0 12px;">
                    <p style="margin:0;font-size:18px;font-weight:700;color:#1C1C1E;text-align:center;">
                      What you'll get
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="33%" style="padding:8px;vertical-align:top;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F2F2F7;border-radius:14px;padding:20px 12px;text-align:center;">
                            <tr><td style="font-size:28px;padding-bottom:8px;">&#x1F4C5;</td></tr>
                            <tr><td style="font-size:13px;font-weight:600;color:#1C1C1E;">AI Scheduling</td></tr>
                            <tr><td style="font-size:11px;color:#8E8E93;padding-top:4px;">Smart job dispatch &amp; routing</td></tr>
                          </table>
                        </td>
                        <td width="33%" style="padding:8px;vertical-align:top;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F2F2F7;border-radius:14px;padding:20px 12px;text-align:center;">
                            <tr><td style="font-size:28px;padding-bottom:8px;">&#x1F4B3;</td></tr>
                            <tr><td style="font-size:13px;font-weight:600;color:#1C1C1E;">Auto Payments</td></tr>
                            <tr><td style="font-size:11px;color:#8E8E93;padding-top:4px;">Invoice &amp; collect instantly</td></tr>
                          </table>
                        </td>
                        <td width="33%" style="padding:8px;vertical-align:top;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F2F2F7;border-radius:14px;padding:20px 12px;text-align:center;">
                            <tr><td style="font-size:28px;padding-bottom:8px;">&#x1F4CD;</td></tr>
                            <tr><td style="font-size:13px;font-weight:600;color:#1C1C1E;">GPS Tracking</td></tr>
                            <tr><td style="font-size:11px;color:#8E8E93;padding-top:4px;">Live crew locations</td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- REFERRAL SECTION -->
          <tr>
            <td style="background-color:#ffffff;padding:0 32px 36px;border-left:1px solid #E5E5EA;border-right:1px solid #E5E5EA;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#007AFF 0%,#AF52DE 100%);border-radius:16px;padding:28px 24px;">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 6px;font-size:18px;font-weight:700;color:#ffffff;">
                      Share to move up
                    </p>
                    <p style="margin:0 0 20px;font-size:13px;color:rgba(255,255,255,0.8);">
                      Each signup moves you 3 spots closer to the front!
                    </p>

                    <!-- Referral link box -->
                    <table role="presentation" cellspacing="0" cellpadding="0" style="background-color:rgba(255,255,255,0.2);border-radius:12px;padding:14px 24px;border:1px solid rgba(255,255,255,0.3);margin-bottom:20px;">
                      <tr>
                        <td align="center">
                          <a href="${links.referralUrl}" style="font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;word-break:break-all;">
                            kleanhq.com/r/${referralCode}
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Share buttons -->
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding:0 8px;">
                          <a href="${links.sms}" style="display:inline-block;background-color:rgba(255,255,255,0.2);color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;padding:10px 18px;border-radius:10px;border:1px solid rgba(255,255,255,0.3);">
                            SMS
                          </a>
                        </td>
                        <td style="padding:0 8px;">
                          <a href="${links.whatsapp}" style="display:inline-block;background-color:rgba(255,255,255,0.2);color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;padding:10px 18px;border-radius:10px;border:1px solid rgba(255,255,255,0.3);">
                            WhatsApp
                          </a>
                        </td>
                        <td style="padding:0 8px;">
                          <a href="${links.email}" style="display:inline-block;background-color:rgba(255,255,255,0.2);color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;padding:10px 18px;border-radius:10px;border:1px solid rgba(255,255,255,0.3);">
                            Email
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- WHAT'S COMING -->
          <tr>
            <td style="background-color:#ffffff;padding:0 32px 36px;border-left:1px solid #E5E5EA;border-right:1px solid #E5E5EA;">
              <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1C1C1E;">
                What's coming
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:8px 0;font-size:14px;line-height:1.5;color:#3A3A3C;">
                    <span style="color:#007AFF;font-weight:600;">&#x2192;</span>&nbsp;&nbsp;AI-powered job scheduling that optimizes your crew's routes
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;line-height:1.5;color:#3A3A3C;">
                    <span style="color:#007AFF;font-weight:600;">&#x2192;</span>&nbsp;&nbsp;Automatic invoicing and payment collection after every job
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;line-height:1.5;color:#3A3A3C;">
                    <span style="color:#007AFF;font-weight:600;">&#x2192;</span>&nbsp;&nbsp;Marketplace to connect pros with homeowners in your area
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;line-height:1.5;color:#3A3A3C;">
                    <span style="color:#007AFF;font-weight:600;">&#x2192;</span>&nbsp;&nbsp;Launching June 1, 2026 — early access for top waitlist spots
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#ffffff;padding:24px 32px 32px;border-top:1px solid #E5E5EA;border-left:1px solid #E5E5EA;border-right:1px solid #E5E5EA;border-bottom:1px solid #E5E5EA;border-radius:0 0 20px 20px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#8E8E93;line-height:1.5;">
                &copy; ${year} TheLevelTeam LLC. All rights reserved.
              </p>
              <p style="margin:0 0 12px;font-size:12px;color:#8E8E93;line-height:1.5;">
                You're receiving this because you signed up for the KleanHQ waitlist.
              </p>
              <p style="margin:0;font-size:12px;">
                <a href="https://kleanhq.com" style="color:#007AFF;text-decoration:none;font-weight:500;">kleanhq.com</a>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <a href="https://kleanhq.com/unsubscribe" style="color:#8E8E93;text-decoration:none;">Unsubscribe</a>
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

/**
 * Sends a branded waitlist confirmation email via Resend.
 * Returns true on success, false on failure.
 */
export async function sendWaitlistConfirmation(
  email: string,
  name: string,
  position: number,
  referralCode: string
): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `You're #${position} on the KleanHQ waitlist!`,
      html: buildEmailHtml(name, position, referralCode),
    });

    if (error) {
      console.error("Failed to send waitlist confirmation email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending waitlist confirmation email:", error);
    return false;
  }
}
