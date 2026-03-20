import { NextRequest, NextResponse } from 'next/server';
import { createConnectAccount, createAccountLink, getAccountStatus } from '@/lib/stripe/connect';

interface CreateConnectBody {
  readonly email: string;
  readonly businessName: string;
  readonly userId: string;
  readonly refreshUrl: string;
  readonly returnUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateConnectBody;

    if (!body.email || !body.businessName || !body.userId) {
      return NextResponse.json(
        { success: false, error: 'Email, business name, and user ID are required' },
        { status: 400 }
      );
    }

    if (!body.refreshUrl || !body.returnUrl) {
      return NextResponse.json(
        { success: false, error: 'Refresh URL and return URL are required' },
        { status: 400 }
      );
    }

    const account = await createConnectAccount({
      email: body.email,
      businessName: body.businessName,
      userId: body.userId,
    });

    const accountLink = await createAccountLink({
      accountId: account.id,
      refreshUrl: body.refreshUrl,
      returnUrl: body.returnUrl,
    });

    return NextResponse.json({
      success: true,
      data: {
        accountId: account.id,
        onboardingUrl: accountLink.url,
        expiresAt: accountLink.expires_at,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create connect account';
    console.error('[API] Create connect account error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const accountId = request.nextUrl.searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Account ID is required' },
        { status: 400 }
      );
    }

    const status = await getAccountStatus(accountId);

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get account status';
    console.error('[API] Get account status error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
