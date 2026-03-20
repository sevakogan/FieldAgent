import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { calculateProcessingFee, applyFeeMode, type FeeMode } from '@/lib/stripe/fees';

interface CreateIntentBody {
  readonly amount: number; // in cents
  readonly customerId: string;
  readonly connectedAccountId?: string;
  readonly feeMode?: FeeMode;
  readonly metadata?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateIntentBody;

    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    if (!body.customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const feeMode = body.feeMode ?? 'absorb';
    const feeResult = applyFeeMode(body.amount, feeMode);
    const { processingFee } = calculateProcessingFee(body.amount);

    const paymentIntentParams: Record<string, unknown> = {
      amount: feeResult.customerPays,
      currency: 'usd',
      customer: body.customerId,
      metadata: {
        platform: 'kleanhq',
        originalAmount: String(body.amount),
        feeMode,
        processingFee: String(processingFee),
        ...body.metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    };

    if (body.connectedAccountId) {
      paymentIntentParams.transfer_data = {
        destination: body.connectedAccountId,
      };
      paymentIntentParams.application_fee_amount = processingFee;
    }

    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentParams as unknown as Parameters<typeof stripe.paymentIntents.create>[0]
    );

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        processingFee,
        feeMode,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create payment intent';
    console.error('[API] Create payment intent error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
