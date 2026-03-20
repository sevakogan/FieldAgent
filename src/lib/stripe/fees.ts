export type FeeMode = 'pass_to_customer' | 'absorb' | 'split';

export interface ProcessingFeeResult {
  readonly grossAmount: number; // in cents
  readonly processingFee: number; // in cents
  readonly netAmount: number; // in cents
}

export interface FeeModeResult {
  readonly customerPays: number; // in cents
  readonly businessAbsorbs: number; // in cents
  readonly processingFee: number; // in cents
}

export interface PlatformMarginResult {
  readonly grossRevenue: number; // in cents
  readonly stripeFee: number; // in cents
  readonly platformFee: number; // in cents
  readonly netToProvider: number; // in cents
}

const STRIPE_PERCENTAGE = 0.029; // 2.9%
const STRIPE_FIXED_FEE = 30; // 30 cents
const DEFAULT_PLATFORM_PERCENTAGE = 0.05; // 5%

export function calculateProcessingFee(
  amountInCents: number
): ProcessingFeeResult {
  if (amountInCents <= 0) {
    return { grossAmount: 0, processingFee: 0, netAmount: 0 };
  }

  const processingFee = Math.round(amountInCents * STRIPE_PERCENTAGE + STRIPE_FIXED_FEE);
  const netAmount = amountInCents - processingFee;

  return {
    grossAmount: amountInCents,
    processingFee,
    netAmount,
  };
}

export function applyFeeMode(
  amountInCents: number,
  mode: FeeMode
): FeeModeResult {
  const { processingFee } = calculateProcessingFee(amountInCents);

  switch (mode) {
    case 'pass_to_customer': {
      return {
        customerPays: amountInCents + processingFee,
        businessAbsorbs: 0,
        processingFee,
      };
    }
    case 'absorb': {
      return {
        customerPays: amountInCents,
        businessAbsorbs: processingFee,
        processingFee,
      };
    }
    case 'split': {
      const halfFee = Math.round(processingFee / 2);
      return {
        customerPays: amountInCents + halfFee,
        businessAbsorbs: processingFee - halfFee,
        processingFee,
      };
    }
  }
}

export function calculatePlatformMargin(
  amountInCents: number,
  platformPercentage: number = DEFAULT_PLATFORM_PERCENTAGE
): PlatformMarginResult {
  const { processingFee } = calculateProcessingFee(amountInCents);
  const platformFee = Math.round(amountInCents * platformPercentage);
  const netToProvider = amountInCents - processingFee - platformFee;

  return {
    grossRevenue: amountInCents,
    stripeFee: processingFee,
    platformFee,
    netToProvider,
  };
}
