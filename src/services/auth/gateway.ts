import { AuthUser, PhoneVerification } from './model';

/** The authentication surface used by the app, independent of any provider.
 *  Implemented on-device by LocalAuthGateway and against Firebase by
 *  FirebaseAuthGateway. */
export interface AuthGateway {
  getCurrentUser(): Promise<AuthUser | null>;
  signOut(): Promise<void>;
  signUpWithEmail(email: string, password: string): Promise<AuthUser>;
  signInWithEmail(email: string, password: string): Promise<AuthUser>;
  signInWithGoogle(): Promise<AuthUser>;
  signInWithApple(): Promise<AuthUser>;
  /** Sends an SMS code and returns a handle whose `confirm` finishes sign-in. */
  startPhoneSignIn(phoneNumber: string): Promise<PhoneVerification>;
}
