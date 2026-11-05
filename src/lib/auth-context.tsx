'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { authApi, setToken, type AdminUser } from './api';

type AuthContextValue = {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    authApi
      .me()
      .then((me) => setUser(me))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { user: loggedInUser, token } = await authApi.login(email, password);
    if (loggedInUser.role !== 'admin') {
      throw new Error('This account does not have admin access.');
    }
    setToken(token);
    setUser(loggedInUser);
    router.push('/subjects');
  }

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      setToken(null);
      setUser(null);
      router.push('/login');
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
