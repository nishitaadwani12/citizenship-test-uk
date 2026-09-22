/** Ads are shown to free users only; premium (subscribed) users are ad-free. */
export function shouldShowAds(isPremium: boolean): boolean {
  return !isPremium;
}
