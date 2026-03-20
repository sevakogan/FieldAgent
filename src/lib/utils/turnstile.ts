const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileVerifyResponse {
  readonly success: boolean;
  readonly "error-codes"?: readonly string[];
  readonly challenge_ts?: string;
  readonly hostname?: string;
}

/**
 * Verifies a Cloudflare Turnstile token server-side.
 * Returns true if the token is valid, false otherwise.
 */
export async function verifyTurnstile(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // Skip verification if secret key not configured or token not provided
  if (!secretKey || !token || token.trim().length === 0) {
    return true;
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
      }),
    });

    if (!response.ok) {
      console.error(
        `Turnstile verification failed with status: ${response.status}`
      );
      return false;
    }

    const data: TurnstileVerifyResponse = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}
