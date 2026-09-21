import { EntitlementService } from './entitlementService';
import { createMemoryStore } from './storage';

describe('EntitlementService', () => {
  it('defaults to no premium', async () => {
    const service = new EntitlementService(createMemoryStore());
    expect(await service.get()).toEqual({ premium: false });
    expect(await service.isPremium()).toBe(false);
  });

  it('grants and reports premium', async () => {
    const service = new EntitlementService(createMemoryStore());
    await service.grantPremium();
    expect(await service.isPremium()).toBe(true);
  });

  it('merges stored partial data with defaults', async () => {
    const store = createMemoryStore({ entitlements: JSON.stringify({}) });
    const service = new EntitlementService(store);
    expect(await service.get()).toEqual({ premium: false });
  });

  it('clears the entitlement', async () => {
    const service = new EntitlementService(createMemoryStore());
    await service.grantPremium();
    await service.clear();
    expect(await service.isPremium()).toBe(false);
  });
});
