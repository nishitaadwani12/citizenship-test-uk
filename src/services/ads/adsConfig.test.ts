import { extractAdmobExtra, readAdUnitIds } from './adsConfig';

describe('extractAdmobExtra', () => {
  it('returns null when any level is missing', () => {
    expect(extractAdmobExtra(null)).toBeNull();
    expect(extractAdmobExtra({ expoConfig: null })).toBeNull();
    expect(extractAdmobExtra({ expoConfig: { extra: null } })).toBeNull();
    expect(extractAdmobExtra({ expoConfig: { extra: {} } })).toBeNull();
  });

  it('returns the admob block when present', () => {
    expect(extractAdmobExtra({ expoConfig: { extra: { admob: { banner: 'b' } } } })).toEqual({
      banner: 'b',
    });
  });
});

describe('readAdUnitIds', () => {
  it('returns nulls when the block is missing', () => {
    expect(readAdUnitIds(null)).toEqual({ banner: null, interstitial: null });
    expect(readAdUnitIds(undefined)).toEqual({ banner: null, interstitial: null });
  });

  it('reads valid string ids and rejects empty or non-string values', () => {
    expect(readAdUnitIds({ banner: 'b', interstitial: 'i' })).toEqual({
      banner: 'b',
      interstitial: 'i',
    });
    expect(readAdUnitIds({ banner: '', interstitial: 123 })).toEqual({
      banner: null,
      interstitial: null,
    });
  });
});
