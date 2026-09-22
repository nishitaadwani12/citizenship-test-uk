import React from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useApp } from '../app/AppContext';
import { adUnitIds } from '../services/ads/adsConfig';
import { shouldShowAds } from '../services/ads/adsGate';

/** Anchored banner ad, shown to free users only. Native implementation; the web
 *  build renders nothing. Excluded from unit-test coverage. */
export function AdBanner(): React.JSX.Element | null {
  const { isPremium } = useApp();
  if (!shouldShowAds(isPremium)) {
    return null;
  }
  const unitId = adUnitIds.banner ?? TestIds.BANNER;
  return (
    <View testID="ad-banner">
      <BannerAd unitId={unitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}
