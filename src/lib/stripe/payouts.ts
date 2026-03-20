import { stripe } from './client';
import type Stripe from 'stripe';

export type PayType = 'hourly' | 'per_job' | 'commission' | 'salary';

export interface PayoutCalculation {
  readonly payType: PayType;
  readonly hoursWorked?: number;
  readonly hourlyRate?: number; // in cents
  readonly jobsCompleted?: number;
  readonly perJobRate?: number; // in cents
  readonly totalRevenue?: number; // in cents (for commission)
  readonly commissionPercent?: number;
  readonly monthlySalary?: number; // in cents
}

export interface PayoutResult {
  readonly grossPay: number; // in cents
  readonly platformFee: number; // in cents
  readonly netPay: number; // in cents
  readonly payType: PayType;
  readonly breakdown: string;
}

export interface TransferParams {
  readonly connectedAccountId: string;
  readonly amount: number; // in cents
  readonly metadata?: Record<string, string>;
}

const PLATFORM_FEE_PERCENT = 0.05; // 5%

export function calculateWorkerPayout(
  params: PayoutCalculation
): PayoutResult {
  const { payType } = params;

  switch (payType) {
    case 'hourly': {
      const hours = params.hoursWorked ?? 0;
      const rate = params.hourlyRate ?? 0;
      const grossPay = Math.round(hours * rate);
      const platformFee = Math.round(grossPay * PLATFORM_FEE_PERCENT);
      return {
        grossPay,
        platformFee,
        netPay: grossPay - platformFee,
        payType,
        breakdown: `${hours} hrs x $${(rate / 100).toFixed(2)}/hr`,
      };
    }

    case 'per_job': {
      const jobs = params.jobsCompleted ?? 0;
      const rate = params.perJobRate ?? 0;
      const grossPay = jobs * rate;
      const platformFee = Math.round(grossPay * PLATFORM_FEE_PERCENT);
      return {
        grossPay,
        platformFee,
        netPay: grossPay - platformFee,
        payType,
        breakdown: `${jobs} jobs x $${(rate / 100).toFixed(2)}/job`,
      };
    }

    case 'commission': {
      const revenue = params.totalRevenue ?? 0;
      const percent = params.commissionPercent ?? 0;
      const grossPay = Math.round(revenue * (percent / 100));
      const platformFee = Math.round(grossPay * PLATFORM_FEE_PERCENT);
      return {
        grossPay,
        platformFee,
        netPay: grossPay - platformFee,
        payType,
        breakdown: `${percent}% of $${(revenue / 100).toFixed(2)} revenue`,
      };
    }

    case 'salary': {
      const grossPay = params.monthlySalary ?? 0;
      const platformFee = Math.round(grossPay * PLATFORM_FEE_PERCENT);
      return {
        grossPay,
        platformFee,
        netPay: grossPay - platformFee,
        payType,
        breakdown: `Monthly salary: $${(grossPay / 100).toFixed(2)}`,
      };
    }
  }
}

export async function createTransfer(
  params: TransferParams
): Promise<Stripe.Transfer> {
  const { connectedAccountId, amount, metadata } = params;

  const transfer = await stripe.transfers.create({
    amount,
    currency: 'usd',
    destination: connectedAccountId,
    metadata: {
      platform: 'kleanhq',
      ...metadata,
    },
  });

  return transfer;
}

export async function createPayout(
  connectedAccountId: string,
  amount: number,
  metadata?: Record<string, string>
): Promise<Stripe.Payout> {
  const payout = await stripe.payouts.create(
    {
      amount,
      currency: 'usd',
      metadata: {
        platform: 'kleanhq',
        ...metadata,
      },
    },
    {
      stripeAccount: connectedAccountId,
    }
  );

  return payout;
}
