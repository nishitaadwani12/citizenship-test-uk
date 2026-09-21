import { EntitlementService } from './entitlementService';
import { IapBackend, IapProduct } from './iapBackend';

/** Product identifiers configured in App Store Connect / Play Console. */
export const LIFETIME_PRODUCT_ID = 'uk_lifetime_unlock';

/** Coordinates store purchases with the on-device entitlement record. */
export class IapService {
  constructor(
    private readonly backend: IapBackend,
    private readonly entitlements: EntitlementService,
  ) {}

  async init(): Promise<void> {
    await this.backend.init();
  }

  async loadProducts(): Promise<IapProduct[]> {
    return this.backend.getProducts([LIFETIME_PRODUCT_ID]);
  }

  /** Buys the lifetime unlock and grants premium on success. */
  async buyLifetime(): Promise<void> {
    await this.backend.purchase(LIFETIME_PRODUCT_ID);
    await this.entitlements.grantPremium();
  }

  /** Restores a previous purchase. Returns true if the lifetime unlock was
   *  found and premium was (re)granted. */
  async restore(): Promise<boolean> {
    const owned = await this.backend.getPurchasedProductIds();
    if (owned.includes(LIFETIME_PRODUCT_ID)) {
      await this.entitlements.grantPremium();
      return true;
    }
    return false;
  }

  async dispose(): Promise<void> {
    await this.backend.end();
  }
}
