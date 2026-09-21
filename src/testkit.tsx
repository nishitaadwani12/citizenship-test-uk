import { render } from '@testing-library/react-native';
import React from 'react';
import { AppProvider } from './app/AppContext';
import { AppServices } from './app/services';
import { AuthService } from './services/authService';
import { EntitlementService } from './services/entitlementService';
import { Hasher } from './services/hasher';
import { IapBackend } from './services/iapBackend';
import { IapService } from './services/iapService';
import { ProgressService } from './services/progressService';
import { createMemoryStore } from './services/storage';

const fakeHasher: Hasher = {
  hash: async (password, salt) => `${salt}:${password}`,
};

/** A controllable fake store backend for IAP tests. */
export function makeFakeBackend(overrides: Partial<IapBackend> = {}): IapBackend {
  return {
    init: jest.fn().mockResolvedValue(undefined),
    getProducts: jest.fn().mockResolvedValue([]),
    purchase: jest.fn().mockResolvedValue(undefined),
    getPurchasedProductIds: jest.fn().mockResolvedValue([]),
    end: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

/** Builds real services over an in-memory store, with a fake IAP backend. */
export function makeServices(iapBackend: IapBackend = makeFakeBackend()): AppServices {
  const store = createMemoryStore();
  const entitlements = new EntitlementService(store);
  return {
    auth: new AuthService(store, fakeHasher, () => 'salt'),
    entitlements,
    progress: new ProgressService(store),
    iap: new IapService(iapBackend, entitlements),
  };
}

/** Renders a component inside a configured AppProvider. */
export function renderWithApp(ui: React.ReactElement, services: AppServices) {
  return render(<AppProvider services={services}>{ui}</AppProvider>);
}
