import React from 'react';

type AuthUser = {
  id: string;
  email: string;
  name: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (next: Pick<AuthUser, 'name' | 'email'>) => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);
const API = '/api/auth';
const ACCESS_KEY = 'fta_access_token';
const USER_KEY = 'fta_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (!saved) return null;
    try { return JSON.parse(saved); } catch { return null; }
  });
  const [loading, setLoading] = React.useState(false);

  const persistUser = (next: AuthUser | null) => {
    setUser(next);
    if (next) localStorage.setItem(USER_KEY, JSON.stringify(next));
    else localStorage.removeItem(USER_KEY);
  };

  const login = React.useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data?.error || 'Login failed' };
      localStorage.setItem(ACCESS_KEY, data.accessToken);
      const name = data.user.email.split('@')[0];
      persistUser({ id: data.user.id, email: data.user.email, name: name.charAt(0).toUpperCase() + name.slice(1) });
      return { ok: true };
    } catch {
      return { ok: false, error: 'Unable to reach server' };
    } finally { setLoading(false); }
  }, []);

  const register = React.useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data?.error || 'Registration failed' };
      return await login(email, password);
    } catch {
      return { ok: false, error: 'Unable to reach server' };
    } finally { setLoading(false); }
  }, [login]);

  const logout = React.useCallback(async () => {
    localStorage.removeItem(ACCESS_KEY);
    persistUser(null);
    await fetch(`${API}/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
  }, []);

  const updateProfile = React.useCallback((next: Pick<AuthUser, 'name' | 'email'>) => {
    if (!user) return;
    persistUser({ ...user, ...next });
  }, [user]);

  return <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
