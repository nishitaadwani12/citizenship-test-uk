import { EntitlementService } from './entitlementService';
import { IapBackend } from './iapBackend';
import { IapService, LIFETIME_PRODUCT_ID } from './iapService';
import { createMemoryStore } from './storage';

function makeBackend(overrides: Partial<IapBackend> = {}): IapBackend {
  return {
    init: jest.fn().mockResolvedValue(undefined),
    getProducts: jest.fn().mockResolvedValue([]),
    purchase: jest.fn().mockResolvedValue(undefined),
    getPurchasedProductIds: jest.fn().mockResolvedValue([]),
    end: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeService(backend: IapBackend) {
  const entitlements = new EntitlementService(createMemoryStore());
  return { service: new IapService(backend, entitlements), entitlements };
}

describe('IapService', () => {
  it('initialises the backend', async () => {
    const backend = makeBackend();
    await makeService(backend).service.init();
    expect(backend.init).toHaveBeenCalled();
  });

  it('loads the lifetime product', async () => {
    const backend = makeBackend({
      getProducts: jest
        .fn()
        .mockResolvedValue([
          { productId: LIFETIME_PRODUCT_ID, title: 'x', description: 'y', price: '£8.99' },
        ]),
    });
    const products = await makeService(backend).service.loadProducts();
    expect(backend.getProducts).toHaveBeenCalledWith([LIFETIME_PRODUCT_ID]);
    expect(products).toHaveLength(1);
  });

  it('grants premium after buying the lifetime unlock', async () => {
    const backend = makeBackend();
    const { service, entitlements } = makeService(backend);
    await service.buyLifetime();
    expect(backend.purchase).toHaveBeenCalledWith(LIFETIME_PRODUCT_ID);
    expect(await entitlements.isPremium()).toBe(true);
  });

  it('restores premium when the lifetime unlock is owned', async () => {
    const backend = makeBackend({
      getPurchasedProductIds: jest.fn().mockResolvedValue([LIFETIME_PRODUCT_ID]),
    });
    const { service, entitlements } = makeService(backend);
    expect(await service.restore()).toBe(true);
    expect(await entitlements.isPremium()).toBe(true);
  });

  it('does not grant premium when nothing is owned', async () => {
    const backend = makeBackend();
    const { service, entitlements } = makeService(backend);
    expect(await service.restore()).toBe(false);
    expect(await entitlements.isPremium()).toBe(false);
  });

  it('disposes the backend', async () => {
    const backend = makeBackend();
    await makeService(backend).service.dispose();
    expect(backend.end).toHaveBeenCalled();
  });
});
