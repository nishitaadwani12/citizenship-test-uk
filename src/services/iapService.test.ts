import { EntitlementService } from './entitlementService';
import { IapBackend } from './iapBackend';
import { IapService } from './iapService';
import { ALL_PLAN_IDS, WEEKLY_PLAN_ID } from './plans';
import { createMemoryStore } from './storage';

function makeBackend(overrides: Partial<IapBackend> = {}): IapBackend {
  return {
    init: jest.fn().mockResolvedValue(undefined),
    getSubscriptions: jest.fn().mockResolvedValue([]),
    purchaseSubscription: jest.fn().mockResolvedValue(undefined),
    getOwnedProductIds: jest.fn().mockResolvedValue([]),
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

  it('loads the subscription plans', async () => {
    const backend = makeBackend({
      getSubscriptions: jest
        .fn()
        .mockResolvedValue([
          { productId: WEEKLY_PLAN_ID, title: 'Weekly', description: 'x', price: '₹150' },
        ]),
    });
    const plans = await makeService(backend).service.loadPlans();
    expect(backend.getSubscriptions).toHaveBeenCalledWith(ALL_PLAN_IDS);
    expect(plans).toHaveLength(1);
  });

  it('grants premium after subscribing', async () => {
    const backend = makeBackend();
    const { service, entitlements } = makeService(backend);
    await service.subscribe(WEEKLY_PLAN_ID);
    expect(backend.purchaseSubscription).toHaveBeenCalledWith(WEEKLY_PLAN_ID);
    expect(await entitlements.isPremium()).toBe(true);
  });

  it('restores premium when a plan is owned', async () => {
    const backend = makeBackend({
      getOwnedProductIds: jest.fn().mockResolvedValue([WEEKLY_PLAN_ID]),
    });
    const { service, entitlements } = makeService(backend);
    expect(await service.restore()).toBe(true);
    expect(await entitlements.isPremium()).toBe(true);
  });

  it('clears premium when no plan is owned', async () => {
    const backend = makeBackend({ getOwnedProductIds: jest.fn().mockResolvedValue(['other']) });
    const { service, entitlements } = makeService(backend);
    await entitlements.grantPremium();
    expect(await service.restore()).toBe(false);
    expect(await entitlements.isPremium()).toBe(false);
  });

  it('disposes the backend', async () => {
    const backend = makeBackend();
    await makeService(backend).service.dispose();
    expect(backend.end).toHaveBeenCalled();
  });
});
