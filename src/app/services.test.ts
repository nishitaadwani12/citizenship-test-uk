import { FirebaseAuthGateway } from '../services/auth/firebaseAuthGateway';
import { LocalAuthGateway } from '../services/auth/localAuthGateway';
import { cryptoHasher } from '../services/hasher';
import { createMemoryStore } from '../services/storage';
import { EntitlementService } from '../services/entitlementService';
import { IapService } from '../services/iapService';
import { ProgressService } from '../services/progressService';
import { createAuthGateway, createServices } from './services';

describe('createServices', () => {
  it('wires the full set of production services (local auth by default)', () => {
    const services = createServices();
    expect(services.auth).toBeInstanceOf(LocalAuthGateway);
    expect(services.entitlements).toBeInstanceOf(EntitlementService);
    expect(services.progress).toBeInstanceOf(ProgressService);
    expect(services.iap).toBeInstanceOf(IapService);
  });
});

describe('createAuthGateway', () => {
  const store = createMemoryStore();

  it('returns the local gateway when Firebase is not configured', () => {
    expect(createAuthGateway(store, cryptoHasher, null)).toBeInstanceOf(LocalAuthGateway);
  });

  it('returns the Firebase gateway when config is present', () => {
    const gateway = createAuthGateway(store, cryptoHasher, {
      apiKey: 'k',
      authDomain: 'd',
      projectId: 'p',
      appId: 'a',
    });
    expect(gateway).toBeInstanceOf(FirebaseAuthGateway);
  });
});
