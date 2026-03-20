import { NextRequest, NextResponse } from 'next/server';
import { calculateMonthlyBill, applyAnnualDiscount } from '@/lib/stripe/billing';
import { calculateProcessingFee, applyFeeMode, calculatePlatformMargin, type FeeMode } from '@/lib/stripe/fees';

interface CalculateBody {
  readonly baseRate: number;
  readonly completedJobs: number;
  readonly perJobRate: number;
  readonly addOns: ReadonlyArray<{
    readonly name: string;
    readonly amount: number;
  }>;
  readonly isAnnualPlan: boolean;
  readonly feeMode?: FeeMode;
  readonly platformPercentage?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CalculateBody;

    if (body.baseRate === undefined || body.baseRate < 0) {
      return NextResponse.json(
        { success: false, error: 'Base rate must be a non-negative number' },
        { status: 400 }
      );
    }

    let bill = calculateMonthlyBill({
      baseRate: body.baseRate,
      completedJobs: body.completedJobs ?? 0,
      perJobRate: body.perJobRate ?? 0,
      addOns: body.addOns ?? [],
    });

    if (body.isAnnualPlan) {
      bill = applyAnnualDiscount(bill);
    }

    const processingFee = calculateProcessingFee(bill.total);
    const feeBreakdown = applyFeeMode(bill.total, body.feeMode ?? 'absorb');
    const platformMargin = calculatePlatformMargin(bill.total, body.platformPercentage);

    return NextResponse.json({
      success: true,
      data: {
        bill,
        processingFee,
        feeBreakdown,
        platformMargin,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to calculate billing';
    console.error('[API] Calculate billing error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
