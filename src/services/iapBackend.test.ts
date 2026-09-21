import * as RNIap from 'react-native-iap';
import { rniapBackend } from './iapBackend';

// react-native-iap is mocked globally in jest.setup.js.
const mocked = RNIap as unknown as {
  initConnection: jest.Mock;
  endConnection: jest.Mock;
  getProducts: jest.Mock;
  requestPurchase: jest.Mock;
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

  it('maps products using localizedPrice and full fields', async () => {
    mocked.getProducts.mockResolvedValue([
      {
        productId: 'p1',
        title: 'Lifetime',
        description: 'All access',
        localizedPrice: '£8.99',
      },
    ]);
    const products = await rniapBackend.getProducts(['p1']);
    expect(mocked.getProducts).toHaveBeenCalledWith({ skus: ['p1'] });
    expect(products).toEqual([
      { productId: 'p1', title: 'Lifetime', description: 'All access', price: '£8.99' },
    ]);
  });

  it('falls back to price and empty strings for missing fields', async () => {
    mocked.getProducts.mockResolvedValue([{ price: '9.99' }]);
    const products = await rniapBackend.getProducts(['p1']);
    expect(products).toEqual([
      { productId: '', title: '', description: '', price: '9.99' },
    ]);
  });

  it('uses an empty price when no price fields are present', async () => {
    mocked.getProducts.mockResolvedValue([{ title: 'No price' }]);
    const products = await rniapBackend.getProducts(['p1']);
    expect(products).toEqual([
      { productId: '', title: 'No price', description: '', price: '' },
    ]);
  });

  it('requests a purchase by sku', async () => {
    await rniapBackend.purchase('p1');
    expect(mocked.requestPurchase).toHaveBeenCalledWith({ sku: 'p1' });
  });

  it('lists owned product ids', async () => {
    mocked.getAvailablePurchases.mockResolvedValue([
      { productId: 'p1' },
      { productId: 'p2' },
    ]);
    expect(await rniapBackend.getPurchasedProductIds()).toEqual(['p1', 'p2']);
  });

  it('ends the store connection', async () => {
    await rniapBackend.end();
    expect(mocked.endConnection).toHaveBeenCalled();
  });
});
