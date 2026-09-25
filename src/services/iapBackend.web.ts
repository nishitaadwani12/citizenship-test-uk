import { IapBackend } from './iapTypes';

export type { IapBackend, IapProduct } from './iapTypes';

/** Web stub: there is no in-app purchasing on web, so the store reports no
 *  products and purchases are unavailable. This keeps the native
 *  react-native-iap module out of the web bundle. Excluded from coverage. */
export const rniapBackend: IapBackend = {
  init: async () => {},
  getSubscriptions: async () => [],
  purchaseSubscription: async () => {
    throw new Error('In-app purchases are not available on web.');
  },
  getOwnedProductIds: async () => [],
  end: async () => {},
};
