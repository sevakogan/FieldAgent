import { stripe } from './client';
import type Stripe from 'stripe';

export interface MonthlyBillParams {
  readonly baseRate: number; // monthly base in cents
  readonly completedJobs: number;
  readonly perJobRate: number; // in cents
  readonly addOns: ReadonlyArray<{
    readonly name: string;
    readonly amount: number; // in cents
  }>;
}

export interface MonthlyBillResult {
  readonly baseCharge: number;
  readonly jobsCharge: number;
  readonly addOnsCharge: number;
  readonly subtotal: number;
  readonly discount: number;
  readonly total: number;
}

export interface PlatformInvoiceParams {
  readonly customerId: string;
  readonly bill: MonthlyBillResult;
  readonly billingPeriod: string; // e.g. "2026-03"
  readonly businessName: string;
}

const ANNUAL_DISCOUNT_PERCENT = 15;

export function calculateMonthlyBill(
  params: MonthlyBillParams
): MonthlyBillResult {
  const { baseRate, completedJobs, perJobRate, addOns } = params;

  const baseCharge = baseRate;
  const jobsCharge = completedJobs * perJobRate;
  const addOnsCharge = addOns.reduce((sum, addOn) => sum + addOn.amount, 0);
  const subtotal = baseCharge + jobsCharge + addOnsCharge;

  return {
    baseCharge,
    jobsCharge,
    addOnsCharge,
    subtotal,
    discount: 0,
    total: subtotal,
  };
}

export function applyAnnualDiscount(
  bill: MonthlyBillResult
): MonthlyBillResult {
  const discount = Math.round(bill.subtotal * (ANNUAL_DISCOUNT_PERCENT / 100));

  return {
    ...bill,
    discount,
    total: bill.subtotal - discount,
  };
}

export async function createPlatformInvoice(
  params: PlatformInvoiceParams
): Promise<Stripe.Invoice> {
  const { customerId, bill, billingPeriod, businessName } = params;

  const invoice = await stripe.invoices.create({
    customer: customerId,
    collection_method: 'send_invoice',
    due_date: Math.floor(Date.now() / 1000) + 15 * 24 * 60 * 60, // 15 days
    metadata: {
      billingPeriod,
      businessName,
      platform: 'kleanhq',
    },
    auto_advance: true,
  });

  const lineItems: Array<{ description: string; amount: number }> = [
    { description: `Base subscription — ${billingPeriod}`, amount: bill.baseCharge },
    { description: `Completed jobs charge (${billingPeriod})`, amount: bill.jobsCharge },
  ];

  if (bill.addOnsCharge > 0) {
    lineItems.push({ description: `Add-ons — ${billingPeriod}`, amount: bill.addOnsCharge });
  }

  if (bill.discount > 0) {
    lineItems.push({ description: `Annual discount`, amount: -bill.discount });
  }

  for (const item of lineItems) {
    if (item.amount !== 0) {
      await stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoice.id,
        description: item.description,
        amount: item.amount,
        currency: 'usd',
      });
    }
  }

  const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
  return finalizedInvoice;
}
