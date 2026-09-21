import Constants from 'expo-constants';

/** Firebase web config. Filled from Expo config `extra.firebase` (which should
 *  read from env vars — never commit real keys). */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  messagingSenderId?: string;
  storageBucket?: string;
}

const REQUIRED_KEYS: (keyof FirebaseConfig)[] = ['apiKey', 'authDomain', 'projectId', 'appId'];

/** Returns a valid config only when every required key is a non-empty string. */
export function readFirebaseConfig(
  extra: Record<string, unknown> | null | undefined,
): FirebaseConfig | null {
  if (!extra) {
    return null;
  }
  for (const key of REQUIRED_KEYS) {
    const value = extra[key];
    if (typeof value !== 'string' || value.length === 0) {
      return null;
    }
  }
  return extra as unknown as FirebaseConfig;
}

/** Shape of the Expo Constants object we read the Firebase block from. */
export interface ConstantsLike {
  expoConfig?: { extra?: Record<string, unknown> | null } | null;
}

/** Pulls the `extra.firebase` block out of an Expo Constants-like object. */
export function extractFirebaseExtra(
  constants: ConstantsLike | null | undefined,
): Record<string, unknown> | null {
  const extra = constants?.expoConfig?.extra;
  const firebase = (extra as { firebase?: Record<string, unknown> } | null | undefined)?.firebase;
  return firebase ?? null;
}

/** The config resolved from the running app's Expo config, or null if absent. */
export const activeFirebaseConfig: FirebaseConfig | null = readFirebaseConfig(
  extractFirebaseExtra(Constants as ConstantsLike),
);

/** Whether Firebase-backed sign-in (email, phone, Google, Apple) is available. */
export function isFirebaseConfigured(): boolean {
  return activeFirebaseConfig !== null;
}
