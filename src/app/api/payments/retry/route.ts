import { NextRequest, NextResponse } from 'next/server';
import { retryFailedPayment, getInvoice } from '@/lib/stripe/invoices';

interface RetryBody {
  readonly invoiceId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RetryBody;

    if (!body.invoiceId) {
      return NextResponse.json(
        { success: false, error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Verify invoice exists and is in a retryable state
    const existingInvoice = await getInvoice(body.invoiceId);

    if (existingInvoice.status === 'paid') {
      return NextResponse.json(
        { success: false, error: 'Invoice is already paid' },
        { status: 400 }
      );
    }

    if (existingInvoice.status === 'void') {
      return NextResponse.json(
        { success: false, error: 'Cannot retry a voided invoice' },
        { status: 400 }
      );
    }

    const invoice = await retryFailedPayment(body.invoiceId);

    return NextResponse.json({
      success: true,
      data: {
        invoiceId: invoice.id,
        status: invoice.status,
        amountDue: invoice.amount_due,
        amountPaid: invoice.amount_paid,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retry payment';
    console.error('[API] Retry payment error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
