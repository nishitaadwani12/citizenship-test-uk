import { AuthService } from '../services/authService';
import { EntitlementService } from '../services/entitlementService';
import { cryptoHasher } from '../services/hasher';
import { rniapBackend } from '../services/iapBackend';
import { IapService } from '../services/iapService';
import { ProgressService } from '../services/progressService';
import { asyncStorageStore } from '../services/storage';

/** The set of services the UI depends on. Bundled so they can be provided as a
 *  unit and swapped for fakes in tests. */
export interface AppServices {
  auth: AuthService;
  entitlements: EntitlementService;
  progress: ProgressService;
  iap: IapService;
}

/** Builds the production services backed by on-device storage and the real
 *  store / crypto modules. */
export function createServices(): AppServices {
  const entitlements = new EntitlementService(asyncStorageStore);
  return {
    auth: new AuthService(asyncStorageStore, cryptoHasher),
    entitlements,
    progress: new ProgressService(asyncStorageStore),
    iap: new IapService(rniapBackend, entitlements),
  };
}
