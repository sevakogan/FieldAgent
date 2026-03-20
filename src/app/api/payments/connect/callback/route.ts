import { NextRequest, NextResponse } from 'next/server';
import { getAccountStatus } from '@/lib/stripe/connect';

export async function GET(request: NextRequest) {
  try {
    const accountId = request.nextUrl.searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.redirect(
        new URL('/dashboard/payments?error=missing_account', request.url)
      );
    }

    const status = await getAccountStatus(accountId);

    if (status.detailsSubmitted && status.chargesEnabled) {
      // TODO: Update connect account status in database
      console.log(`[Connect Callback] Account ${accountId} onboarding complete`, status);

      return NextResponse.redirect(
        new URL(`/dashboard/payments?success=true&accountId=${accountId}`, request.url)
      );
    }

    // Onboarding incomplete — redirect back with status
    console.log(`[Connect Callback] Account ${accountId} onboarding incomplete`, status);

    return NextResponse.redirect(
      new URL(`/dashboard/payments?incomplete=true&accountId=${accountId}`, request.url)
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Callback processing failed';
    console.error('[API] Connect callback error:', error);

    return NextResponse.redirect(
      new URL(`/dashboard/payments?error=${encodeURIComponent(message)}`, request.url)
    );
  }
}
