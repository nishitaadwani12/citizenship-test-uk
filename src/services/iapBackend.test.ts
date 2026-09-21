import * as RNIap from 'react-native-iap';
import { rniapBackend } from './iapBackend';

// react-native-iap is mocked globally in jest.setup.js.
const mocked = RNIap as unknown as {
  initConnection: jest.Mock;
  endConnection: jest.Mock;
  getSubscriptions: jest.Mock;
  requestSubscription: jest.Mock;
  getAvailablePurchases: jest.Mock;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('rniapBackend', () => {
  it('initialises the store connection', async () => {
    await rniapBackend.init();
    expect(mocked.initConnection).toHaveBeenCalled();
  });

  it('maps subscriptions using localizedPrice and full fields', async () => {
    mocked.getSubscriptions.mockResolvedValue([
      { productId: 'p1', title: 'Weekly', description: 'All access', localizedPrice: '₹150' },
    ]);
    const products = await rniapBackend.getSubscriptions(['p1']);
    expect(mocked.getSubscriptions).toHaveBeenCalledWith({ skus: ['p1'] });
    expect(products).toEqual([
      { productId: 'p1', title: 'Weekly', description: 'All access', price: '₹150' },
    ]);
  });

  it('falls back to price and empty strings for missing fields', async () => {
    mocked.getSubscriptions.mockResolvedValue([{ price: '150' }]);
    expect(await rniapBackend.getSubscriptions(['p1'])).toEqual([
      { productId: '', title: '', description: '', price: '150' },
    ]);
  });

  it('uses an empty price when no price fields are present', async () => {
    mocked.getSubscriptions.mockResolvedValue([{ title: 'No price' }]);
    expect(await rniapBackend.getSubscriptions(['p1'])).toEqual([
      { productId: '', title: 'No price', description: '', price: '' },
    ]);
  });

  it('requests a subscription by sku', async () => {
    await rniapBackend.purchaseSubscription('p1');
    expect(mocked.requestSubscription).toHaveBeenCalledWith({ sku: 'p1' });
  });

  it('lists owned product ids', async () => {
    mocked.getAvailablePurchases.mockResolvedValue([{ productId: 'p1' }, { productId: 'p2' }]);
    expect(await rniapBackend.getOwnedProductIds()).toEqual(['p1', 'p2']);
  });

  it('ends the store connection', async () => {
    await rniapBackend.end();
    expect(mocked.endConnection).toHaveBeenCalled();
  });
});
