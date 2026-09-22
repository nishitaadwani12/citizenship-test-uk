import { shouldShowAds } from './adsGate';

describe('shouldShowAds', () => {
  it('shows ads to free users', () => {
    expect(shouldShowAds(false)).toBe(true);
  });

  it('hides ads from premium users', () => {
    expect(shouldShowAds(true)).toBe(false);
  });
});
