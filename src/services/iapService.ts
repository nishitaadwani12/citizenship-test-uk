import { ALL_PLAN_IDS } from './plans';
import { EntitlementService } from './entitlementService';
import { IapBackend, IapProduct } from './iapBackend';

/** Coordinates subscription purchases with the on-device entitlement record.
 *
 *  Note: entitlement is tracked on-device. For production, validate receipts
 *  server-side (or via RevenueCat) to reflect renewals/cancellations reliably —
 *  see README. `restore()` re-checks currently-owned products. */
export class IapService {
  constructor(
    private readonly backend: IapBackend,
    private readonly entitlements: EntitlementService,
  ) {}

  async init(): Promise<void> {
    await this.backend.init();
  }

  /** Loads the subscription plans with localized store pricing. */
  async loadPlans(): Promise<IapProduct[]> {
    return this.backend.getSubscriptions(ALL_PLAN_IDS);
  }

  /** Subscribes to a plan and grants premium on success. */
  async subscribe(productId: string): Promise<void> {
    await this.backend.purchaseSubscription(productId);
    await this.entitlements.grantPremium();
  }

  /** Restores premium if the user owns any recognised subscription. Also clears
   *  premium if none is owned, so a lapsed subscription is reflected. */
  async restore(): Promise<boolean> {
    const owned = await this.backend.getOwnedProductIds();
    const hasPlan = owned.some((id) => ALL_PLAN_IDS.includes(id));
    if (hasPlan) {
      await this.entitlements.grantPremium();
      return true;
    }
    await this.entitlements.clear();
    return false;
  }

  async dispose(): Promise<void> {
    await this.backend.end();
  }
}
