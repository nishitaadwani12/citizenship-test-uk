import { KeyValueStore } from './storage';

const ENTITLEMENTS_KEY = 'entitlements';

/** What the user has unlocked. A single "premium" flag drives ad removal and
 *  full access to the question bank and mock exams. */
export interface Entitlements {
  premium: boolean;
}

const DEFAULT_ENTITLEMENTS: Entitlements = { premium: false };

/** Persists and reports the user's premium entitlement. Updated by the IAP
 *  service after a successful purchase or restore. */
export class EntitlementService {
  constructor(private readonly store: KeyValueStore) {}

  async get(): Promise<Entitlements> {
    const raw = await this.store.getItem(ENTITLEMENTS_KEY);
    if (!raw) {
      return { ...DEFAULT_ENTITLEMENTS };
    }
    return { ...DEFAULT_ENTITLEMENTS, ...(JSON.parse(raw) as Partial<Entitlements>) };
  }

  async isPremium(): Promise<boolean> {
    return (await this.get()).premium;
  }

  async grantPremium(): Promise<void> {
    await this.store.setItem(ENTITLEMENTS_KEY, JSON.stringify({ premium: true }));
  }

  async clear(): Promise<void> {
    await this.store.removeItem(ENTITLEMENTS_KEY);
  }
}
