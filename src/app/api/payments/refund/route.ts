import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';

interface RefundBody {
  readonly paymentIntentId: string;
  readonly amount?: number; // partial refund in cents, omit for full
  readonly reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  readonly metadata?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RefundBody;

    if (!body.paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Verify the payment intent exists and is refundable
    const paymentIntent = await stripe.paymentIntents.retrieve(body.paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { success: false, error: `Cannot refund a payment with status: ${paymentIntent.status}` },
        { status: 400 }
      );
    }

    if (body.amount !== undefined && body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Refund amount must be positive' },
        { status: 400 }
      );
    }

    if (body.amount !== undefined && body.amount > paymentIntent.amount) {
      return NextResponse.json(
        { success: false, error: 'Refund amount cannot exceed original payment amount' },
        { status: 400 }
      );
    }

    const refundParams: Record<string, unknown> = {
      payment_intent: body.paymentIntentId,
      metadata: {
        platform: 'kleanhq',
        ...body.metadata,
      },
    };

    if (body.amount !== undefined) {
      refundParams.amount = body.amount;
    }

    if (body.reason) {
      refundParams.reason = body.reason;
    }

    const refund = await stripe.refunds.create(
      refundParams as Parameters<typeof stripe.refunds.create>[0]
    );

    return NextResponse.json({
      success: true,
      data: {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
        paymentIntentId: body.paymentIntentId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process refund';
    console.error('[API] Refund error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
