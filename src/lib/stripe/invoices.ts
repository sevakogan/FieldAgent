import { stripe } from './client';
import type Stripe from 'stripe';

export interface InvoiceParams {
  readonly customerId: string;
  readonly items: ReadonlyArray<{
    readonly description: string;
    readonly amount: number; // in cents
    readonly quantity: number;
  }>;
  readonly dueDate?: Date;
  readonly metadata?: Record<string, string>;
}

export interface InvoiceEmailParams {
  readonly invoiceId: string;
  readonly recipientEmail: string;
  readonly recipientName: string;
}

export async function generateInvoice(
  params: InvoiceParams
): Promise<Stripe.Invoice> {
  const { customerId, items, dueDate, metadata } = params;

  const invoice = await stripe.invoices.create({
    customer: customerId,
    collection_method: 'send_invoice',
    due_date: dueDate
      ? Math.floor(dueDate.getTime() / 1000)
      : Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    metadata: metadata ?? {},
    auto_advance: true,
  });

  for (const item of items) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (stripe.invoiceItems.create as any)({
      customer: customerId,
      invoice: invoice.id,
      description: item.description,
      unit_amount: item.amount,
      quantity: item.quantity,
    });
  }

  const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
  return finalizedInvoice;
}

export async function sendInvoiceEmail(
  params: InvoiceEmailParams
): Promise<Stripe.Invoice> {
  const { invoiceId } = params;

  const invoice = await stripe.invoices.sendInvoice(invoiceId);
  return invoice;
}

export async function retryFailedPayment(
  invoiceId: string
): Promise<Stripe.Invoice> {
  const invoice = await stripe.invoices.pay(invoiceId, {
    forgive: false,
  });

  return invoice;
}

export async function voidInvoice(
  invoiceId: string
): Promise<Stripe.Invoice> {
  const invoice = await stripe.invoices.voidInvoice(invoiceId);
  return invoice;
}

export async function getInvoice(
  invoiceId: string
): Promise<Stripe.Invoice> {
  const invoice = await stripe.invoices.retrieve(invoiceId);
  return invoice;
}
