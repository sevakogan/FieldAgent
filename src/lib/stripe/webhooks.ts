import type Stripe from 'stripe';
import { stripe, STRIPE_WEBHOOK_SECRET } from './client';

export interface WebhookResult {
  readonly handled: boolean;
  readonly eventType: string;
  readonly message: string;
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  return stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
}

export async function handleStripeWebhook(
  event: Stripe.Event
): Promise<WebhookResult> {
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSucceeded(paymentIntent);
      return {
        handled: true,
        eventType: event.type,
        message: `Payment ${paymentIntent.id} succeeded for $${(paymentIntent.amount / 100).toFixed(2)}`,
      };
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailed(paymentIntent);
      return {
        handled: true,
        eventType: event.type,
        message: `Payment ${paymentIntent.id} failed: ${paymentIntent.last_payment_error?.message ?? 'Unknown error'}`,
      };
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaid(invoice);
      return {
        handled: true,
        eventType: event.type,
        message: `Invoice ${invoice.id} paid`,
      };
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaymentFailed(invoice);
      return {
        handled: true,
        eventType: event.type,
        message: `Invoice ${invoice.id} payment failed`,
      };
    }

    case 'account.updated': {
      const account = event.data.object as Stripe.Account;
      await handleAccountUpdated(account);
      return {
        handled: true,
        eventType: event.type,
        message: `Connect account ${account.id} updated`,
      };
    }

    case 'transfer.created': {
      const transfer = event.data.object as Stripe.Transfer;
      return {
        handled: true,
        eventType: event.type,
        message: `Transfer ${transfer.id} created for $${(transfer.amount / 100).toFixed(2)}`,
      };
    }

    case 'payout.paid': {
      const payout = event.data.object as Stripe.Payout;
      return {
        handled: true,
        eventType: event.type,
        message: `Payout ${payout.id} paid: $${(payout.amount / 100).toFixed(2)}`,
      };
    }

    case 'payout.failed': {
      const payout = event.data.object as Stripe.Payout;
      return {
        handled: true,
        eventType: event.type,
        message: `Payout ${payout.id} failed: ${payout.failure_message ?? 'Unknown'}`,
      };
    }

    default: {
      return {
        handled: false,
        eventType: event.type,
        message: `Unhandled event type: ${event.type}`,
      };
    }
  }
}

async function handlePaymentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  // TODO: Update booking/job status in database
  // TODO: Send payment receipt email
  // TODO: Trigger worker payout if applicable
  console.log(`[Webhook] Payment succeeded: ${paymentIntent.id}`, {
    amount: paymentIntent.amount,
    customerId: paymentIntent.customer,
    metadata: paymentIntent.metadata,
  });
}

async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  // TODO: Update payment status in database
  // TODO: Send payment failed email
  // TODO: Schedule retry if applicable
  console.log(`[Webhook] Payment failed: ${paymentIntent.id}`, {
    error: paymentIntent.last_payment_error?.message,
    customerId: paymentIntent.customer,
  });
}

async function handleInvoicePaid(
  invoice: Stripe.Invoice
): Promise<void> {
  // TODO: Mark invoice as paid in database
  // TODO: Update subscription status if applicable
  console.log(`[Webhook] Invoice paid: ${invoice.id}`, {
    amount: invoice.amount_paid,
    customerId: invoice.customer,
  });
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
): Promise<void> {
  // TODO: Mark invoice as failed in database
  // TODO: Send dunning email
  console.log(`[Webhook] Invoice payment failed: ${invoice.id}`, {
    amount: invoice.amount_due,
    customerId: invoice.customer,
    attemptCount: invoice.attempt_count,
  });
}

async function handleAccountUpdated(
  account: Stripe.Account
): Promise<void> {
  // TODO: Update connect account status in database
  console.log(`[Webhook] Account updated: ${account.id}`, {
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  });
}
