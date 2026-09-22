import Constants from 'expo-constants';

/** AdMob ad-unit IDs, read from Expo config `extra.admob`. When absent, the
 *  native layer falls back to Google's test ad units, so the app shows test ads
 *  in development without any configuration. */
export interface AdUnitIds {
  banner: string | null;
  interstitial: string | null;
}

/** Extracts the `extra.admob` block from an Expo Constants-like object. */
export function extractAdmobExtra(
  constants: { expoConfig?: { extra?: Record<string, unknown> | null } | null } | null | undefined,
): Record<string, unknown> | null {
  const extra = constants?.expoConfig?.extra;
  const admob = (extra as { admob?: Record<string, unknown> } | null | undefined)?.admob;
  return admob ?? null;
}

/** Reads ad-unit IDs, returning null for any that are missing/empty. */
export function readAdUnitIds(admob: Record<string, unknown> | null | undefined): AdUnitIds {
  const pick = (key: string): string | null => {
    const value = admob?.[key];
    return typeof value === 'string' && value.length > 0 ? value : null;
  };
  return { banner: pick('banner'), interstitial: pick('interstitial') };
}

/** The ad-unit IDs for the running app (null => use test ads). */
export const adUnitIds: AdUnitIds = readAdUnitIds(extractAdmobExtra(Constants));
