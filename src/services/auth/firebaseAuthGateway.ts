import { AuthGateway } from './gateway';
import { requireE164 } from './phoneAuth';
import { AuthError, AuthProviderId, AuthUser, PhoneVerification } from './model';

/** A provider user as returned by the Firebase layer, before normalisation. */
export interface RawAuthUser {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
}

/** The Firebase-backed primitives the gateway orchestrates. Implemented for
 *  real in authWiring using the Firebase JS SDK + Expo auth modules, and faked
 *  in unit tests. */
export interface FirebaseAuthDeps {
  signUpEmail(email: string, password: string): Promise<RawAuthUser>;
  signInEmail(email: string, password: string): Promise<RawAuthUser>;
  signInWithGoogle(): Promise<RawAuthUser>;
  signInWithApple(): Promise<RawAuthUser>;
  startPhone(
    phoneE164: string,
  ): Promise<{ verificationId: string; confirm(code: string): Promise<RawAuthUser> }>;
  signOut(): Promise<void>;
  deleteAccount(): Promise<void>;
  getCurrentUser(): Promise<RawAuthUser | null>;
}

function toAuthUser(raw: RawAuthUser, provider: AuthProviderId): AuthUser {
  return {
    id: raw.uid,
    email: raw.email,
    phoneNumber: raw.phoneNumber,
    displayName: raw.displayName,
    provider,
  };
}

/** Wraps a rejected primitive call in an AuthError with a friendly message. */
async function guard<T>(action: () => Promise<T>, message: string): Promise<T> {
  try {
    return await action();
  } catch (e) {
    if (e instanceof AuthError) {
      throw e;
    }
    throw new AuthError(message);
  }
}

/** Multi-provider authentication backed by Firebase. */
export class FirebaseAuthGateway implements AuthGateway {
  constructor(private readonly deps: FirebaseAuthDeps) {}

  async signUpWithEmail(email: string, password: string): Promise<AuthUser> {
    const raw = await guard(
      () => this.deps.signUpEmail(email.trim().toLowerCase(), password),
      'Could not create your account. Please try again.',
    );
    return toAuthUser(raw, 'email');
  }

  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const raw = await guard(
      () => this.deps.signInEmail(email.trim().toLowerCase(), password),
      'Could not sign you in. Check your details and try again.',
    );
    return toAuthUser(raw, 'email');
  }

  async signInWithGoogle(): Promise<AuthUser> {
    const raw = await guard(
      () => this.deps.signInWithGoogle(),
      'Google sign-in was cancelled or failed.',
    );
    return toAuthUser(raw, 'google');
  }

  async signInWithApple(): Promise<AuthUser> {
    const raw = await guard(
      () => this.deps.signInWithApple(),
      'Apple sign-in was cancelled or failed.',
    );
    return toAuthUser(raw, 'apple');
  }

  async startPhoneSignIn(phoneNumber: string): Promise<PhoneVerification> {
    const e164 = requireE164(phoneNumber);
    const pending = await guard(
      () => this.deps.startPhone(e164),
      'Could not send the verification code. Please try again.',
    );
    return {
      verificationId: pending.verificationId,
      confirm: async (code: string) => {
        const raw = await guard(
          () => pending.confirm(code),
          'That code was not correct. Please try again.',
        );
        return toAuthUser(raw, 'phone');
      },
    };
  }

  async signOut(): Promise<void> {
    await this.deps.signOut();
  }

  async deleteAccount(): Promise<void> {
    await guard(
      () => this.deps.deleteAccount(),
      'Could not delete your account. Please sign in again and retry.',
    );
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const raw = await this.deps.getCurrentUser();
    if (!raw) {
      return null;
    }
    // Best-effort provider inference for a restored session.
    const provider: AuthProviderId = raw.phoneNumber && !raw.email ? 'phone' : 'email';
    return toAuthUser(raw, provider);
  }
}
