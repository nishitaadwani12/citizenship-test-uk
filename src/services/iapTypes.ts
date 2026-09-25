/** Shared IAP types used by both the native adapter and the web stub. */

/** A subscription product as surfaced to the UI. */
export interface IapProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
}

/** The store operations the app needs for subscriptions. Implemented for real
 *  by the react-native-iap adapter (native) and stubbed on web. */
export interface IapBackend {
  init(): Promise<void>;
  getSubscriptions(productIds: string[]): Promise<IapProduct[]>;
  purchaseSubscription(productId: string): Promise<void>;
  /** Product ids the user currently owns / has an active subscription for. */
  getOwnedProductIds(): Promise<string[]>;
  end(): Promise<void>;
}
