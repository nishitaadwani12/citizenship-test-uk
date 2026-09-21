/** A subscription plan the user can buy. `productId` must match the product
 *  configured in App Store Connect / Google Play Console. Prices shown here are
 *  the intended INR anchor + rough equivalents; the store returns the real
 *  localized price at runtime (see IapService.loadPlans). */
export interface SubscriptionPlan {
  productId: string;
  title: string;
  /** Human description of the billing period. */
  period: string;
  /** Fallback price shown before the store's localized price loads. */
  fallbackPrice: string;
  /** Marketing note, e.g. best-value badge. */
  note?: string;
}

export const WEEKLY_PLAN_ID = 'uk_premium_weekly';
export const QUARTERLY_PLAN_ID = 'uk_premium_quarterly';

/** The plans offered on the paywall. Weekly is the default; quarterly is the
 *  cheaper-per-week option. */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    productId: WEEKLY_PLAN_ID,
    title: 'Weekly',
    period: 'per week',
    fallbackPrice: '₹150',
  },
  {
    productId: QUARTERLY_PLAN_ID,
    title: '3 months',
    period: 'every 3 months',
    fallbackPrice: '₹1,500',
    note: 'Best value',
  },
];

/** All product ids the app recognises as granting premium. */
export const ALL_PLAN_IDS: string[] = SUBSCRIPTION_PLANS.map((p) => p.productId);
