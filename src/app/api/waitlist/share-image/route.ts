import { NextResponse, type NextRequest } from "next/server";

interface ShareImageBody {
  readonly referralCode?: string;
}

function generateSvg(referralCode: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#007AFF;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#AF52DE;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#5AC8FA;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="card" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.95" />
      <stop offset="100%" style="stop-color:#F2F2F7;stop-opacity:0.95" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1080" fill="url(#bg)" rx="0" />

  <!-- Decorative circles -->
  <circle cx="200" cy="200" r="300" fill="white" opacity="0.05" />
  <circle cx="880" cy="880" r="250" fill="white" opacity="0.05" />

  <!-- Card -->
  <rect x="140" y="240" width="800" height="600" rx="40" fill="url(#card)" />

  <!-- Logo -->
  <text x="540" y="380" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="800" fill="#1C1C1E" letter-spacing="-2">
    KleanHQ
  </text>

  <!-- Tagline -->
  <text x="540" y="440" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="#636366">
    The future of professional cleaning
  </text>

  <!-- Divider -->
  <line x1="340" y1="480" x2="740" y2="480" stroke="#E5E5EA" stroke-width="2" />

  <!-- Join text -->
  <text x="540" y="550" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="700" fill="#007AFF">
    Join the Waitlist
  </text>

  <!-- Referral code -->
  <rect x="340" y="590" width="400" height="70" rx="16" fill="#F2F2F7" />
  <text x="540" y="636" text-anchor="middle" font-family="monospace" font-size="28" font-weight="600" fill="#1C1C1E">
    kleanhq.com?ref=${referralCode}
  </text>

  <!-- CTA -->
  <text x="540" y="760" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#AEAEB2">
    Skip the line with my referral link
  </text>

  <!-- Bottom badge -->
  <rect x="390" y="920" width="300" height="50" rx="25" fill="white" opacity="0.2" />
  <text x="540" y="953" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="white">
    kleanhq.com
  </text>
</svg>`;
}

export async function POST(request: NextRequest) {
  try {
    const body: ShareImageBody = await request.json();

    const referralCode = body.referralCode?.trim();

    if (!referralCode || referralCode.length === 0) {
      return NextResponse.json(
        { error: "Referral code is required." },
        { status: 400 }
      );
    }

    const svg = generateSvg(referralCode);

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Share image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image." },
      { status: 500 }
    );
  }
}
