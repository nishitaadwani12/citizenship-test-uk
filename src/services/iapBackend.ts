import * as RNIap from 'react-native-iap';

/** Store product as surfaced to the UI. */
export interface IapProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
}

/** The store operations the app needs. Implemented for real by the
 *  react-native-iap adapter below and faked in unit tests. */
export interface IapBackend {
  init(): Promise<void>;
  getProducts(productIds: string[]): Promise<IapProduct[]>;
  purchase(productId: string): Promise<void>;
  getPurchasedProductIds(): Promise<string[]>;
  end(): Promise<void>;
}

/**
 * Typed facade over the subset of react-native-iap we use. The library's own
 * types shift between versions, so we pin to this narrow shape and cast once.
 */
interface RniapModule {
  initConnection(): Promise<unknown>;
  endConnection(): Promise<unknown>;
  getProducts(params: { skus: string[] }): Promise<Array<Record<string, unknown>>>;
  requestPurchase(params: { sku: string }): Promise<unknown>;
  getAvailablePurchases(): Promise<Array<{ productId: string }>>;
}

const iap = RNIap as unknown as RniapModule;

/** Real store adapter backed by react-native-iap. Requires a development or
 *  production build (not Expo Go) and store products configured. */
export const rniapBackend: IapBackend = {
  init: async () => {
    await iap.initConnection();
  },
  getProducts: async (productIds) => {
    const products = await iap.getProducts({ skus: productIds });
    return products.map((p) => ({
      productId: String(p.productId ?? ''),
      title: String(p.title ?? ''),
      description: String(p.description ?? ''),
      price: String(p.localizedPrice ?? p.price ?? ''),
    }));
  },
  purchase: async (productId) => {
    await iap.requestPurchase({ sku: productId });
  },
  getPurchasedProductIds: async () => {
    const purchases = await iap.getAvailablePurchases();
    return purchases.map((p) => p.productId);
  },
  end: async () => {
    await iap.endConnection();
  },
};
