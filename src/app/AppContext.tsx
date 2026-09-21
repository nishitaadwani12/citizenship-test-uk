import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthUser } from '../services/authService';
import { AppServices, createServices } from './services';

/** App-wide state and actions exposed to screens. */
export interface AppContextValue {
  loading: boolean;
  user: AuthUser | null;
  isPremium: boolean;
  services: AppServices;
  signUp(email: string, password: string): Promise<void>;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  refreshPremium(): Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

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

  const signUp = useCallback(
    async (email: string, password: string) => {
      setUser(await resolved.auth.signUp(email, password));
      await refreshPremium();
    },
    [resolved, refreshPremium],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      setUser(await resolved.auth.login(email, password));
      await refreshPremium();
    },
    [resolved, refreshPremium],
  );

  const logout = useCallback(async () => {
    await resolved.auth.logout();
    setUser(null);
  }, [resolved]);

  const value: AppContextValue = {
    loading,
    user,
    isPremium,
    services: resolved,
    signUp,
    login,
    logout,
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
