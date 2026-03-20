import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, handleStripeWebhook } from '@/lib/stripe/webhooks';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const payload = await request.text();

    let event;
    try {
      event = constructWebhookEvent(payload, signature);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid webhook signature';
      console.error('[Webhook] Signature verification failed:', message);
      return NextResponse.json(
        { success: false, error: `Webhook signature verification failed: ${message}` },
        { status: 400 }
      );
    }

    const result = await handleStripeWebhook(event);

    console.log(`[Webhook] ${result.eventType}: ${result.message} (handled: ${result.handled})`);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed';
    console.error('[Webhook] Processing error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
