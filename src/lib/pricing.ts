// ─────────────────────────────────────────────────────────────────
// PRICING — single source of truth
//
// PRICING RULES:
//   Starter    1–10  properties  $20/mo
//   Growth    11–30  properties  $40/mo
//   Pro       31–75  properties  $79/mo
//   Enterprise  75+  properties  Custom
//   Rule: different address = different property (unique address key)
//
// REFERRAL RULES:
//   Owner → Client:          No reward
//   Owner → Owner:           New owner 45 days free on signup
//                            Inviter gets 30 days free when they pay
//   Every 5 paying owners:   Milestone reward [PLACEHOLDER]
//   Client → Owner (paying): Client reward    [PLACEHOLDER]
// ─────────────────────────────────────────────────────────────────

export interface Tier {
  id: string;
  label: string;
  min: number;
  max: number;
  price: number | null;
  billing: string;
  tagline: string;
  popular?: boolean;
  features: string[];
  cta: string;
}

export const TIERS: Tier[] = [
  {
    id: "starter",
    label: "Starter",
    min: 1,
    max: 10,
    price: 20,
    billing: "month",
    tagline: "Solo operator just getting organized",
    features: [
      "Up to 10 properties",
      "Client dashboard",
      "Job scheduling",
      "Invoicing + payments",
      "SMS notifications",
      "Basic reporting",
    ],
    cta: "Start Free Trial",
  },
  {
    id: "growth",
    label: "Growth",
    min: 11,
    max: 30,
    price: 40,
    billing: "month",
    tagline: "Expanding crew, needs the tools",
    popular: true,
    features: [
      "Up to 30 properties",
      "Everything in Starter",
      "Worker accounts",
      "Route optimizer",
      "Smart review gate",
      "WhatsApp notifications",
      "Revenue analytics",
    ],
    cta: "Start Free Trial",
  },
  {
    id: "pro",
    label: "Pro",
    min: 31,
    max: 75,
    price: 79,
    billing: "month",
    tagline: "Real operation, multiple workers",
    features: [
      "Up to 75 properties",
      "Everything in Growth",
      "Multi-crew management",
      "Advanced reporting",
      "API access",
      "Priority support",
      "Custom integrations",
    ],
    cta: "Start Free Trial",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    min: 76,
    max: Infinity,
    price: null,
    billing: "month",
    tagline: "Large operations, custom needs",
    features: [
      "Unlimited properties",
      "Everything in Pro",
      "Dedicated account manager",
      "Custom onboarding",
      "SLA guarantee",
      "Volume discounts",
      "White-label option",
    ],
    cta: "Contact sales",
  },
];

export function getTier(propertyCount: number): Tier {
  return TIERS.find(t => propertyCount >= t.min && propertyCount <= t.max) ?? TIERS[3];
}

export function getTierById(id: string): Tier {
  return TIERS.find(t => t.id === id) ?? TIERS[0];
}
