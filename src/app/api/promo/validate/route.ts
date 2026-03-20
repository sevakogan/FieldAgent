import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';

interface ValidatePromoBody {
  readonly code: string;
  readonly customerId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ValidatePromoBody;

    if (!body.code || body.code.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Promo code is required' },
        { status: 400 }
      );
    }

    const normalizedCode = body.code.trim().toUpperCase();

    // Search for the promotion code in Stripe
    const promotionCodes = await stripe.promotionCodes.list({
      code: normalizedCode,
      active: true,
      limit: 1,
    });

    if (promotionCodes.data.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          valid: false,
          reason: 'Promo code not found or inactive',
        },
      });
    }

    const promoCode = promotionCodes.data[0] as unknown as Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coupon = promoCode.coupon as any;

    // Check expiration
    if (coupon.redeem_by && coupon.redeem_by < Math.floor(Date.now() / 1000)) {
      return NextResponse.json({
        success: true,
        data: {
          valid: false,
          reason: 'Promo code has expired',
        },
      });
    }

    // Check max redemptions
    if (coupon.max_redemptions && coupon.times_redeemed >= coupon.max_redemptions) {
      return NextResponse.json({
        success: true,
        data: {
          valid: false,
          reason: 'Promo code has reached maximum redemptions',
        },
      });
    }

    // Check customer restrictions
    if (promoCode.customer && body.customerId && promoCode.customer !== body.customerId) {
      return NextResponse.json({
        success: true,
        data: {
          valid: false,
          reason: 'Promo code is not valid for this customer',
        },
      });
    }

    const discount = coupon.percent_off
      ? { type: 'percent' as const, value: coupon.percent_off }
      : { type: 'fixed' as const, value: coupon.amount_off ?? 0 };

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        promoCodeId: promoCode.id,
        couponId: coupon.id,
        code: normalizedCode,
        discount,
        duration: coupon.duration,
        durationInMonths: coupon.duration_in_months,
        name: coupon.name,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to validate promo code';
    console.error('[API] Validate promo error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
