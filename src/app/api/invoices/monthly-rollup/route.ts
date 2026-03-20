import { NextRequest, NextResponse } from 'next/server';
import { calculateMonthlyBill, applyAnnualDiscount, createPlatformInvoice } from '@/lib/stripe/billing';

interface MonthlyRollupBody {
  readonly customerId: string;
  readonly businessName: string;
  readonly billingPeriod: string; // e.g. "2026-03"
  readonly baseRate: number; // in cents
  readonly completedJobs: number;
  readonly perJobRate: number; // in cents
  readonly addOns: ReadonlyArray<{
    readonly name: string;
    readonly amount: number;
  }>;
  readonly isAnnualPlan: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MonthlyRollupBody;

    if (!body.customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    if (!body.billingPeriod || !/^\d{4}-\d{2}$/.test(body.billingPeriod)) {
      return NextResponse.json(
        { success: false, error: 'Billing period must be in YYYY-MM format' },
        { status: 400 }
      );
    }

    if (!body.businessName) {
      return NextResponse.json(
        { success: false, error: 'Business name is required' },
        { status: 400 }
      );
    }

    let bill = calculateMonthlyBill({
      baseRate: body.baseRate,
      completedJobs: body.completedJobs,
      perJobRate: body.perJobRate,
      addOns: body.addOns ?? [],
    });

    if (body.isAnnualPlan) {
      bill = applyAnnualDiscount(bill);
    }

    const invoice = await createPlatformInvoice({
      customerId: body.customerId,
      bill,
      billingPeriod: body.billingPeriod,
      businessName: body.businessName,
    });

    return NextResponse.json({
      success: true,
      data: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        bill,
        status: invoice.status,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        pdfUrl: invoice.invoice_pdf,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create monthly rollup';
    console.error('[API] Monthly rollup error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
