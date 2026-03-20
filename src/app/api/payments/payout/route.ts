import { NextRequest, NextResponse } from 'next/server';
import { calculateWorkerPayout, createTransfer, type PayoutCalculation } from '@/lib/stripe/payouts';

interface PayoutBody {
  readonly connectedAccountId: string;
  readonly calculation: PayoutCalculation;
  readonly metadata?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PayoutBody;

    if (!body.connectedAccountId) {
      return NextResponse.json(
        { success: false, error: 'Connected account ID is required' },
        { status: 400 }
      );
    }

    if (!body.calculation?.payType) {
      return NextResponse.json(
        { success: false, error: 'Pay type is required in calculation' },
        { status: 400 }
      );
    }

    const validPayTypes = ['hourly', 'per_job', 'commission', 'salary'] as const;
    if (!validPayTypes.includes(body.calculation.payType)) {
      return NextResponse.json(
        { success: false, error: `Invalid pay type. Must be one of: ${validPayTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const payoutResult = calculateWorkerPayout(body.calculation);

    if (payoutResult.netPay <= 0) {
      return NextResponse.json(
        { success: false, error: 'Calculated payout amount must be positive' },
        { status: 400 }
      );
    }

    const transfer = await createTransfer({
      connectedAccountId: body.connectedAccountId,
      amount: payoutResult.netPay,
      metadata: {
        payType: payoutResult.payType,
        grossPay: String(payoutResult.grossPay),
        platformFee: String(payoutResult.platformFee),
        breakdown: payoutResult.breakdown,
        ...body.metadata,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        transferId: transfer.id,
        payout: payoutResult,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process payout';
    console.error('[API] Payout error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
