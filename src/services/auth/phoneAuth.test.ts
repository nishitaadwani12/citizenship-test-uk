import { isValidE164, isValidOtp, normalizePhone, requireE164 } from './phoneAuth';

describe('normalizePhone', () => {
  it('strips spaces, dashes, dots and parentheses', () => {
    expect(normalizePhone('+44 (7700) 900-123.')).toBe('+447700900123');
  });
});

describe('isValidE164', () => {
  it('accepts a valid international number', () => {
    expect(isValidE164('+447700900123')).toBe(true);
  });

  it('rejects numbers without a plus or with a leading zero', () => {
    expect(isValidE164('447700900123')).toBe(false);
    expect(isValidE164('+0447700900')).toBe(false);
    expect(isValidE164('+')).toBe(false);
  });
});

describe('requireE164', () => {
  it('normalises and returns a valid number', () => {
    expect(requireE164('+44 7700 900123')).toBe('+447700900123');
  });

  it('throws on an invalid number', () => {
    expect(() => requireE164('0770')).toThrow(/valid phone number/);
  });
});

describe('isValidOtp', () => {
  it('accepts 4–8 digit codes', () => {
    expect(isValidOtp('123456')).toBe(true);
    expect(isValidOtp('1234')).toBe(true);
  });

  it('rejects malformed codes', () => {
    expect(isValidOtp('12')).toBe(false);
    expect(isValidOtp('12a456')).toBe(false);
  });
});
