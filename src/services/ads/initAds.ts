import mobileAds from 'react-native-google-mobile-ads';

/** Initializes the Google Mobile Ads SDK. Native implementation; web is a
 *  no-op. Excluded from unit-test coverage. */
export function initAds(): void {
  mobileAds()
    .initialize()
    .catch(() => {
      // Non-fatal: ads simply won't show if initialization fails.
    });
}
