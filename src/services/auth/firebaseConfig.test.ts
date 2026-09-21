import {
  extractFirebaseExtra,
  isFirebaseConfigured,
  readFirebaseConfig,
} from './firebaseConfig';

const valid = { apiKey: 'k', authDomain: 'd', projectId: 'p', appId: 'a' };

describe('readFirebaseConfig', () => {
  it('returns null for missing extra', () => {
    expect(readFirebaseConfig(null)).toBeNull();
    expect(readFirebaseConfig(undefined)).toBeNull();
  });

  it('returns null when a required key is absent', () => {
    expect(readFirebaseConfig({ apiKey: 'k' })).toBeNull();
  });

  it('returns null when a required key is empty or the wrong type', () => {
    expect(readFirebaseConfig({ ...valid, apiKey: '' })).toBeNull();
    expect(readFirebaseConfig({ ...valid, apiKey: 123 })).toBeNull();
  });

  it('returns the config when all required keys are present', () => {
    expect(readFirebaseConfig({ ...valid })).toEqual(valid);
  });
});

describe('extractFirebaseExtra', () => {
  it('returns null when any level is missing', () => {
    expect(extractFirebaseExtra(null)).toBeNull();
    expect(extractFirebaseExtra({ expoConfig: null })).toBeNull();
    expect(extractFirebaseExtra({ expoConfig: { extra: null } })).toBeNull();
    expect(extractFirebaseExtra({ expoConfig: { extra: {} } })).toBeNull();
  });

  it('returns the firebase block when present', () => {
    expect(
      extractFirebaseExtra({ expoConfig: { extra: { firebase: { apiKey: 'k' } } } }),
    ).toEqual({ apiKey: 'k' });
  });
});

describe('isFirebaseConfigured', () => {
  it('is false in the test environment (no config)', () => {
    expect(isFirebaseConfigured()).toBe(false);
  });
});
