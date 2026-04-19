"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getMe, obtainToken, TOKEN_STORAGE, UserProfile } from "./api";

type AuthState = {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = TOKEN_STORAGE.access;
    if (!access) {
      setLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => {
        TOKEN_STORAGE.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const tokens = await obtainToken(email, password);
    TOKEN_STORAGE.setAccess(tokens.access);
    TOKEN_STORAGE.setRefresh(tokens.refresh);
    const profile = await getMe();
    setUser(profile);
  }, []);

  const signOut = useCallback(() => {
    TOKEN_STORAGE.clear();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const profile = await getMe();
    setUser(profile);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
