const REFERRAL_CODE_LENGTH = 6;
const REFERRAL_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Generates a 6-character uppercase alphanumeric referral code.
 * Uses crypto.getRandomValues for cryptographic randomness.
 */
export function generateReferralCode(): string {
  const values = new Uint32Array(REFERRAL_CODE_LENGTH);
  crypto.getRandomValues(values);

  return Array.from(values)
    .map((v) => REFERRAL_CODE_CHARS[v % REFERRAL_CODE_CHARS.length])
    .join("");
}

interface WaitlistEntry {
  readonly id: string;
  readonly referral_count: number;
  readonly created_at: string;
}

interface PositionedEntry {
  readonly id: string;
  readonly position: number;
}

const REFERRAL_BOOST = 3;

/**
 * Recalculates positions for all waitlist entries.
 * Base position = signup order (by created_at).
 * Each referral moves the entry up by 3 spots.
 * Ties are broken by created_at (earlier = higher).
 *
 * Returns a new array of { id, position } — never mutates input.
 */
export function calculatePositions(
  entries: readonly WaitlistEntry[]
): readonly PositionedEntry[] {
  // Sort by created_at ascending to establish base order
  const sorted = [...entries].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Assign base positions (1-indexed) and compute effective score
  const scored = sorted.map((entry, index) => ({
    id: entry.id,
    basePosition: index + 1,
    boost: entry.referral_count * REFERRAL_BOOST,
    createdAt: new Date(entry.created_at).getTime(),
  }));

  // Sort by effective position (lower is better):
  //   effectivePosition = basePosition - boost
  //   ties broken by createdAt ascending
  const ranked = [...scored].sort((a, b) => {
    const effectiveA = a.basePosition - a.boost;
    const effectiveB = b.basePosition - b.boost;

    if (effectiveA !== effectiveB) {
      return effectiveA - effectiveB;
    }
    return a.createdAt - b.createdAt;
  });

  return ranked.map((entry, index) => ({
    id: entry.id,
    position: index + 1,
  }));
}
