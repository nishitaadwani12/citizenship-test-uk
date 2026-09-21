/** Removes spaces, dashes, dots and parentheses from a phone number. */
export function normalizePhone(input: string): string {
  return input.replace(/[\s\-().]/g, '');
}

/** Validates a phone number in E.164 form: a leading '+', a non-zero first
 *  digit, and 1–15 digits total. */
export function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{1,14}$/.test(phone);
}

/** Normalises then validates a phone number, throwing a message on failure. */
export function requireE164(input: string): string {
  const normalized = normalizePhone(input);
  if (!isValidE164(normalized)) {
    throw new Error('Enter a valid phone number in international format, e.g. +447700900123.');
  }
  return normalized;
}

/** Validates a 4–8 digit SMS one-time code. */
export function isValidOtp(code: string): boolean {
  return /^\d{4,8}$/.test(code);
}
