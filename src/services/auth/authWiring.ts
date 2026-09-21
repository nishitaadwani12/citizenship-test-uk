/**
 * Activation layer that binds the FirebaseAuthGateway to the real Firebase JS
 * SDK and Expo auth modules. This file is intentionally excluded from unit-test
 * coverage: it is thin glue over external SDKs and only runs once you supply
 * Firebase config (see firebaseConfig.ts) and the native setup described in the
 * README. All heavy imports are lazy `require`s so importing this module never
 * pulls native code into the web/Expo Go bundle.
 *
 * TODO (you): set EXPO_PUBLIC_GOOGLE_* client IDs and complete the native
 * Google/Apple/phone setup before these methods will authenticate.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FirebaseApp } from 'firebase/app';
import type { Auth, User } from 'firebase/auth';
import { FirebaseAuthDeps, FirebaseAuthGateway, RawAuthUser } from './firebaseAuthGateway';
import { FirebaseConfig } from './firebaseConfig';
import { AuthGateway } from './gateway';
import { AuthError } from './model';

function mapUser(user: User): RawAuthUser {
  return {
    uid: user.uid,
    email: user.email,
    phoneNumber: user.phoneNumber,
    displayName: user.displayName,
  };
}

let cachedAuth: Auth | null = null;

function getAuthInstance(config: FirebaseConfig): Auth {
  if (cachedAuth) {
    return cachedAuth;
  }
  /* eslint-disable @typescript-eslint/no-var-requires */
  const { initializeApp, getApps, getApp } = require('firebase/app');
  const { initializeApp: _i, ...authModule } = require('firebase/auth');
  /* eslint-enable @typescript-eslint/no-var-requires */
  const app: FirebaseApp = getApps().length ? getApp() : initializeApp(config);
  cachedAuth =
    authModule.getReactNativePersistence !== undefined
      ? authModule.initializeAuth(app, {
          persistence: authModule.getReactNativePersistence(AsyncStorage),
        })
      : authModule.getAuth(app);
  return cachedAuth as Auth;
}

/** Builds the Firebase-backed auth deps for the given config. */
export function buildFirebaseDeps(config: FirebaseConfig): FirebaseAuthDeps {
  const auth = () => getAuthInstance(config);
  return {
    signUpEmail: async (email, password) => {
      const { createUserWithEmailAndPassword } = require('firebase/auth');
      const cred = await createUserWithEmailAndPassword(auth(), email, password);
      return mapUser(cred.user);
    },
    signInEmail: async (email, password) => {
      const { signInWithEmailAndPassword } = require('firebase/auth');
      const cred = await signInWithEmailAndPassword(auth(), email, password);
      return mapUser(cred.user);
    },
    signInWithGoogle: async () => {
      // Obtain a Google ID token via expo-auth-session, then exchange it with
      // Firebase. Requires EXPO_PUBLIC_GOOGLE_* client IDs and redirect setup.
      const Google = require('expo-auth-session/providers/google');
      const { GoogleAuthProvider, signInWithCredential } = require('firebase/auth');
      const idToken = await Google.getIdTokenImperativeAsync?.();
      if (!idToken) {
        throw new AuthError('Google sign-in is not fully configured yet.');
      }
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth(), credential);
      return mapUser(result.user);
    },
    signInWithApple: async () => {
      const AppleAuthentication = require('expo-apple-authentication');
      const { OAuthProvider, signInWithCredential } = require('firebase/auth');
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({ idToken: appleCredential.identityToken });
      const result = await signInWithCredential(auth(), credential);
      return mapUser(result.user);
    },
    startPhone: async (phoneE164) => {
      // Native phone auth is most reliable via @react-native-firebase/auth.
      // The JS SDK path below needs a reCAPTCHA verifier (see README).
      const { signInWithPhoneNumber } = require('firebase/auth');
      const confirmation = await signInWithPhoneNumber(auth(), phoneE164);
      return {
        verificationId: confirmation.verificationId,
        confirm: async (code: string) => {
          const result = await confirmation.confirm(code);
          return mapUser(result.user);
        },
      };
    },
    signOut: async () => {
      const { signOut } = require('firebase/auth');
      await signOut(auth());
    },
    getCurrentUser: async () => {
      const current = auth().currentUser;
      return current ? mapUser(current) : null;
    },
  };
}

/** Builds a Firebase-backed AuthGateway for the given config. */
export function buildFirebaseGateway(config: FirebaseConfig): AuthGateway {
  return new FirebaseAuthGateway(buildFirebaseDeps(config));
}
