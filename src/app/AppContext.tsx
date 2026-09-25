import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthUser, PhoneVerification } from '../services/auth/model';
import { AppServices, createServices } from './services';

/** App-wide state and actions exposed to screens. */
export interface AppContextValue {
  loading: boolean;
  user: AuthUser | null;
  isPremium: boolean;
  services: AppServices;
  signUpWithEmail(email: string, password: string): Promise<void>;
  signInWithEmail(email: string, password: string): Promise<void>;
  signInWithGoogle(): Promise<void>;
  signInWithApple(): Promise<void>;
  startPhoneSignIn(phoneNumber: string): Promise<PhoneVerification>;
  confirmPhone(verification: PhoneVerification, code: string): Promise<void>;
  logout(): Promise<void>;
  deleteAccount(): Promise<void>;
  refreshPremium(): Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

/** Demo account used by app-store reviewers; treated as premium (they cannot
 *  complete a real purchase during review). */
const REVIEWER_EMAIL = 'reviewer@nivee.app';

/** Provides authentication and entitlement state to the tree. Services can be
 *  injected for testing; production defaults to on-device services. */
export function AppProvider({
  services,
  children,
}: {
  services?: AppServices;
  children: React.ReactNode;
}): React.JSX.Element {
  const resolved = useMemo(() => services ?? createServices(), [services]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  const refreshPremium = useCallback(async () => {
    setIsPremium(await resolved.entitlements.isPremium());
  }, [resolved]);

  useEffect(() => {
    let active = true;
    (async () => {
      const current = await resolved.auth.getCurrentUser();
      const premium = await resolved.entitlements.isPremium();
      if (active) {
        setUser(current);
        setIsPremium(premium);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [resolved]);

  const applyUser = useCallback(
    async (signedIn: AuthUser) => {
      setUser(signedIn);
      await refreshPremium();
    },
    [refreshPremium],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      await applyUser(await resolved.auth.signUpWithEmail(email, password));
    },
    [resolved, applyUser],
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      await applyUser(await resolved.auth.signInWithEmail(email, password));
    },
    [resolved, applyUser],
  );

  const signInWithGoogle = useCallback(async () => {
    await applyUser(await resolved.auth.signInWithGoogle());
  }, [resolved, applyUser]);

  const signInWithApple = useCallback(async () => {
    await applyUser(await resolved.auth.signInWithApple());
  }, [resolved, applyUser]);

  const startPhoneSignIn = useCallback(
    (phoneNumber: string) => resolved.auth.startPhoneSignIn(phoneNumber),
    [resolved],
  );

  const confirmPhone = useCallback(
    async (verification: PhoneVerification, code: string) => {
      await applyUser(await verification.confirm(code));
    },
    [applyUser],
  );

  const logout = useCallback(async () => {
    await resolved.auth.signOut();
    setUser(null);
  }, [resolved]);

  const deleteAccount = useCallback(async () => {
    await resolved.auth.deleteAccount();
    setUser(null);
  }, [resolved]);

  const value: AppContextValue = {
    loading,
    user,
    // The store reviewer's demo account is treated as premium so reviewers can
    // access premium content without making a purchase (they can't buy in review).
    isPremium: isPremium || user?.email === REVIEWER_EMAIL,
    services: resolved,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithApple,
    startPhoneSignIn,
    confirmPhone,
    logout,
    deleteAccount,
    refreshPremium,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/** Accesses the app context. Throws if used outside the provider. */
export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return value;
}
