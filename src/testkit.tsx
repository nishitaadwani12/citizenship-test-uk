import { render } from '@testing-library/react-native';
import React from 'react';
import { AppProvider } from './app/AppContext';
import { AppServices } from './app/services';
import { AuthGateway } from './services/auth/gateway';
import { LocalAuthGateway } from './services/auth/localAuthGateway';
import { AuthUser } from './services/auth/model';
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

function userFor(id: string, provider: AuthUser['provider']): AuthUser {
  return { id, email: `${id}`, phoneNumber: null, displayName: null, provider };
}

/** A fully fake AuthGateway for exercising social/phone flows in UI tests. */
export function makeFakeAuthGateway(overrides: Partial<AuthGateway> = {}): AuthGateway {
  return {
    getCurrentUser: jest.fn().mockResolvedValue(null),
    signOut: jest.fn().mockResolvedValue(undefined),
    signUpWithEmail: jest.fn(async (email: string) => userFor(email, 'email')),
    signInWithEmail: jest.fn(async (email: string) => userFor(email, 'email')),
    signInWithGoogle: jest.fn(async () => userFor('g@x.com', 'google')),
    signInWithApple: jest.fn(async () => userFor('a@x.com', 'apple')),
    startPhoneSignIn: jest.fn(async () => ({
      verificationId: 'vid',
      confirm: jest.fn(async () => userFor('+447700900123', 'phone')),
    })),
    ...overrides,
  };
}

/** Builds real services over an in-memory store. Any service can be overridden. */
export function makeServices(overrides: Partial<AppServices> = {}): AppServices {
  const store = createMemoryStore();
  const entitlements = new EntitlementService(store);
  return {
    auth: new LocalAuthGateway(store, fakeHasher, () => 'salt'),
    entitlements,
    progress: new ProgressService(store),
    iap: new IapService(makeFakeBackend(), entitlements),
    ...overrides,
  };
}

/** Convenience: services whose IAP uses the given fake backend. */
export function makeServicesWithBackend(backend: IapBackend): AppServices {
  const store = createMemoryStore();
  const entitlements = new EntitlementService(store);
  return {
    auth: new LocalAuthGateway(store, fakeHasher, () => 'salt'),
    entitlements,
    progress: new ProgressService(store),
    iap: new IapService(backend, entitlements),
  };
}

/** Renders a component inside a configured AppProvider. */
export function renderWithApp(ui: React.ReactElement, services: AppServices) {
  return render(<AppProvider services={services}>{ui}</AppProvider>);
}
