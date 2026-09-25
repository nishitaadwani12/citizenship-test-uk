import * as RNIap from 'react-native-iap';
import { IapBackend } from './iapTypes';

export type { IapBackend, IapProduct } from './iapTypes';

/** Typed facade over the subset of react-native-iap we use. The library's own
 *  types shift between versions, so we pin to this narrow shape and cast once. */
interface RniapModule {
  initConnection(): Promise<unknown>;
  endConnection(): Promise<unknown>;
  getSubscriptions(params: { skus: string[] }): Promise<Array<Record<string, unknown>>>;
  requestSubscription(params: { sku: string }): Promise<unknown>;
  getAvailablePurchases(): Promise<Array<{ productId: string }>>;
}

const iap = RNIap as unknown as RniapModule;

/** Real store adapter backed by react-native-iap. Requires a development or
 *  production build (not Expo Go) with subscription products configured. */
export const rniapBackend: IapBackend = {
  init: async () => {
    await iap.initConnection();
  },
  getSubscriptions: async (productIds) => {
    const products = await iap.getSubscriptions({ skus: productIds });
    return products.map((p) => ({
      productId: String(p.productId ?? ''),
      title: String(p.title ?? ''),
      description: String(p.description ?? ''),
      price: String(p.localizedPrice ?? p.price ?? ''),
    }));
  },
  purchaseSubscription: async (productId) => {
    await iap.requestSubscription({ sku: productId });
  },
  getOwnedProductIds: async () => {
    const purchases = await iap.getAvailablePurchases();
    return purchases.map((p) => p.productId);
  },
  end: async () => {
    await iap.endConnection();
  },
};
