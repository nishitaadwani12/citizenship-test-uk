import mobileAds, { AdsConsent } from 'react-native-google-mobile-ads';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

/**
 * Initializes ads with privacy compliance:
 *  1. iOS App Tracking Transparency (ATT) prompt (no-op on Android).
 *  2. Google UMP consent form (GDPR/EU) — requests an info update and shows the
 *     consent form if required.
 *  3. Initializes the Google Mobile Ads SDK.
 * Native implementation; the web build is a no-op. Excluded from unit-test
 * coverage. All steps are best-effort: failures are non-fatal.
 */
export async function initAds(): Promise<void> {
  try {
    await requestTrackingPermissionsAsync();
  } catch {
    // ATT not available / declined — continue with non-personalized ads.
  }
  try {
    await AdsConsent.requestInfoUpdate();
    await AdsConsent.loadAndShowConsentFormIfRequired();
  } catch {
    // Consent flow unavailable — continue; ads may be non-personalized.
  }
  try {
    await mobileAds().initialize();
  } catch {
    // Non-fatal: ads simply won't show if initialization fails.
  }
}
