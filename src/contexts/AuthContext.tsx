import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api, registerUnauthorizedHandler } from '@/lib/api';
import {
  clearSession, isSessionLive, setSession,
} from '@/lib/auth';
import type { TokenResponse } from '@/types/api';
import { env } from '@/lib/env';

export type Role = 'user' | 'admin';

interface User {
  email: string;
  name: string;
  role: Role;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  /** Email + password style login for the operator UI. */
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  /** Switch between user/admin views — purely UI-side until a real RBAC is in place. */
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = 'sp.user';

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(() =>
    isSessionLive() ? loadStoredUser() : null,
  );

  const signOut = useCallback(() => {
    clearSession();
    localStorage.removeItem(USER_KEY);
    setUser(null);
    navigate('/login', { replace: true, state: { from: location.pathname } });
  }, [navigate, location.pathname]);

  // Wire the api 401 handler to our sign-out routine
  useEffect(() => {
    registerUnauthorizedHandler(signOut);
  }, [signOut]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      // POST /api/v1/auth/token with client_credentials grant.
      // The backend issues a JWT we attach via Bearer in api.ts.
      // We treat (email, password) as (clientId, clientSecret) for now —
      // swap for a real /auth/login endpoint when one exists.
      const { data } = await api.post<TokenResponse>('/auth/token', {
        clientId: email || env.clientId,
        clientSecret: password,
      });
      const expiresAt = Date.now() + data.expiresIn * 1000;
      setSession({ accessToken: data.accessToken, expiresAt });

      const nextUser: User = {
        email,
        name: deriveName(email),
        role: 'user',
      };
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      setUser(nextUser);

      const from = (location.state as { from?: string } | null)?.from ?? '/';
      navigate(from, { replace: true });
    },
    [navigate, location.state],
  );

  const switchRole = useCallback((role: Role) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, role };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      signIn,
      signOut,
      switchRole,
    }),
    [user, signIn, signOut, switchRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

function deriveName(email: string): string {
  const local = email.split('@')[0] ?? email;
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(' ') || email;
}
