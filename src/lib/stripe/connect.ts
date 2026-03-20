import { stripe } from './client';
import type Stripe from 'stripe';

export interface ConnectAccountParams {
  readonly email: string;
  readonly businessName: string;
  readonly userId: string;
}

export interface AccountLinkParams {
  readonly accountId: string;
  readonly refreshUrl: string;
  readonly returnUrl: string;
}

export interface ConnectAccountStatus {
  readonly accountId: string;
  readonly chargesEnabled: boolean;
  readonly payoutsEnabled: boolean;
  readonly detailsSubmitted: boolean;
  readonly requirements: Stripe.Account.Requirements | null;
}

export async function createConnectAccount(
  params: ConnectAccountParams
): Promise<Stripe.Account> {
  const { email, businessName, userId } = params;

  const account = await stripe.accounts.create({
    type: 'express',
    email,
    business_profile: {
      name: businessName,
    },
    metadata: {
      userId,
      platform: 'kleanhq',
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  return account;
}

export async function createAccountLink(
  params: AccountLinkParams
): Promise<Stripe.AccountLink> {
  const { accountId, refreshUrl, returnUrl } = params;

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });

  return accountLink;
}

export async function getAccountStatus(
  accountId: string
): Promise<ConnectAccountStatus> {
  const account = await stripe.accounts.retrieve(accountId);

  return {
    accountId: account.id,
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
    detailsSubmitted: account.details_submitted ?? false,
    requirements: account.requirements ?? null,
  };
}
