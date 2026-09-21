import { AuthGateway } from '../services/auth/gateway';
import { activeFirebaseConfig, FirebaseConfig } from '../services/auth/firebaseConfig';
import { LocalAuthGateway } from '../services/auth/localAuthGateway';
import { EntitlementService } from '../services/entitlementService';
import { cryptoHasher, Hasher } from '../services/hasher';
import { rniapBackend } from '../services/iapBackend';
import { IapService } from '../services/iapService';
import { ProgressService } from '../services/progressService';
import { asyncStorageStore, KeyValueStore } from '../services/storage';

/** The set of services the UI depends on. */
export interface AppServices {
  auth: AuthGateway;
  entitlements: EntitlementService;
  progress: ProgressService;
  iap: IapService;
}

/** Chooses the Firebase gateway when config is present, else the on-device
 *  local gateway. The Firebase wiring is required lazily so its SDKs are never
 *  loaded (or bundled into web/Expo Go execution) until actually used. */
export function createAuthGateway(
  store: KeyValueStore,
  hasher: Hasher,
  config: FirebaseConfig | null = activeFirebaseConfig,
): AuthGateway {
  if (config) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { buildFirebaseGateway } = require('../services/auth/authWiring');
    return buildFirebaseGateway(config);
  }
  return new LocalAuthGateway(store, hasher);
}

/** Builds the production services backed by on-device storage and the real
 *  store / crypto modules. */
export function createServices(): AppServices {
  const entitlements = new EntitlementService(asyncStorageStore);
  return {
    auth: createAuthGateway(asyncStorageStore, cryptoHasher),
    entitlements,
    progress: new ProgressService(asyncStorageStore),
    iap: new IapService(rniapBackend, entitlements),
  };
}
