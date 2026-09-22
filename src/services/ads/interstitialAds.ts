import { AdEventType, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import { adUnitIds } from './adsConfig';

/** Loads and shows a full-screen interstitial ad for free users. No-op for
 *  premium users. Best-effort: failures are non-fatal. Native implementation;
 *  the web build uses the no-op variant. Excluded from unit-test coverage. */
export function maybeShowInterstitial(isPremium: boolean): void {
  if (isPremium) {
    return;
  }
  const unitId = adUnitIds.interstitial ?? TestIds.INTERSTITIAL;
  const ad = InterstitialAd.createForAdRequest(unitId);
  const unsubscribe = ad.addAdEventListener(AdEventType.LOADED, () => {
    ad.show();
    unsubscribe();
  });
  ad.load();
}
