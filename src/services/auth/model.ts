/** The sign-in methods the app supports. */
export type AuthProviderId = 'email' | 'phone' | 'google' | 'apple';

/** The signed-in user, normalised across every provider. */
export interface AuthUser {
  id: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  provider: AuthProviderId;
}

/** A pending phone verification. `confirm` completes sign-in with the SMS code. */
export interface PhoneVerification {
  verificationId: string;
  confirm(code: string): Promise<AuthUser>;
}

/** Error type surfaced to the UI for any authentication failure. */
export class AuthError extends Error {}

/** A human-friendly label for the signed-in user. */
export function displayIdentity(user: AuthUser | null): string {
  if (!user) {
    return 'there';
  }
  return user.displayName ?? user.email ?? user.phoneNumber ?? 'there';
}
