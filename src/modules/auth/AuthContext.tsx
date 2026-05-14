import React from 'react';

type AuthUser = {
  name: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (next: AuthUser) => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);
const KEY = 'fta_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(KEY);
    if (!saved) return null;
    try { return JSON.parse(saved); } catch { return null; }
  });

  const persist = React.useCallback((next: AuthUser | null) => {
    setUser(next);
    if (next) localStorage.setItem(KEY, JSON.stringify(next));
    else localStorage.removeItem(KEY);
  }, []);

  const login = React.useCallback((email: string, password: string) => {
    if (!email || !password) return false;
    const name = email.split('@')[0] || 'User';
    persist({ name: name.charAt(0).toUpperCase() + name.slice(1), email });
    return true;
  }, [persist]);

  const logout = React.useCallback(() => persist(null), [persist]);
  const updateProfile = React.useCallback((next: AuthUser) => persist(next), [persist]);

  return <AuthContext.Provider value={{ user, login, logout, updateProfile }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
