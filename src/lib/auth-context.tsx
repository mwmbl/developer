"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getMe, obtainToken, TOKEN_STORAGE, UserProfile, Agreement, getAgreements, acceptAgreement } from "./api";

type AuthState = {
  user: UserProfile | null;
  loading: boolean;
  agreements: Agreement[] | null;
  hasAgreedToTerms: boolean;
  signIn: (email: string, password: string) => Promise<{ hasAgreedToTerms: boolean }>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
  acceptTerms: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  agreements: null,
  hasAgreedToTerms: false,
  signIn: async () => ({ hasAgreedToTerms: false }),
  signOut: () => {},
  refreshUser: async () => {},
  acceptTerms: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreements, setAgreements] = useState<Agreement[] | null>(null);

  const hasAgreedToTerms =
    agreements?.some((a) => a.agreement_type === "TERMS_OF_SERVICE_API") ?? false;

  useEffect(() => {
    const access = TOKEN_STORAGE.access;
    if (!access) {
      setLoading(false);
      return;
    }
    Promise.all([getMe(), getAgreements()])
      .then(([profile, agrs]) => {
        setUser(profile);
        setAgreements(agrs);
      })
      .catch(() => {
        TOKEN_STORAGE.clear();
        setUser(null);
        setAgreements(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const tokens = await obtainToken(email, password);
    TOKEN_STORAGE.setAccess(tokens.access);
    TOKEN_STORAGE.setRefresh(tokens.refresh);
    const [profile, agrs] = await Promise.all([getMe(), getAgreements()]);
    setUser(profile);
    setAgreements(agrs);
    const agreed = agrs.some((a) => a.agreement_type === "TERMS_OF_SERVICE_API");
    return { hasAgreedToTerms: agreed };
  }, []);

  const signOut = useCallback(() => {
    TOKEN_STORAGE.clear();
    setUser(null);
    setAgreements(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const profile = await getMe();
    setUser(profile);
  }, []);

  const acceptTerms = useCallback(async () => {
    const agreement = await acceptAgreement("TERMS_OF_SERVICE_API");
    setAgreements((prev) => [...(prev ?? []), agreement]);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, agreements, hasAgreedToTerms, signIn, signOut, refreshUser, acceptTerms }}>
      {children}
    </AuthContext.Provider>
  );
}
