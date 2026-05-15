import React from 'react';

type AuthUser = {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  role?: 'USER' | 'ADMIN' | 'SUPERADMIN';
  isActive?: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (payload: { fullName: string; email: string; password: string; confirmPassword: string; phone?: string }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (next: Pick<AuthUser, 'fullName' | 'phone'>) => Promise<{ ok: boolean; error?: string }>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const API = `${API_BASE_URL}/api/auth`;
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

  const readResponseBody = async (res: Response) => {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return res.json();
    const text = await res.text();
    return { error: text || 'Unexpected server response' };
  };

  const login = React.useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/login`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await readResponseBody(res);
      if (!res.ok) return { ok: false, error: data?.error || 'Login failed' };
      persistUser(data.user);
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: 'Unable to reach server. Ensure backend is running and VITE_API_BASE_URL is configured if API is hosted separately.',
      };
    }
    finally { setLoading(false); }
  }, []);

  const register = React.useCallback(async (payload) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await readResponseBody(res);
      if (!res.ok) return { ok: false, error: data?.error || 'Registration failed' };
      return await login(payload.email, payload.password);
    } catch {
      return {
        ok: false,
        error: 'Unable to reach server. Ensure backend is running and VITE_API_BASE_URL is configured if API is hosted separately.',
      };
    }
    finally { setLoading(false); }
  }, [login]);

  const logout = React.useCallback(async () => {
    persistUser(null);
    await fetch(`${API}/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
  }, []);

  const updateProfile = React.useCallback(async (next) => {
    try {
      const res = await fetch(`${API}/profile`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
      const data = await readResponseBody(res);
      if (!res.ok) return { ok: false, error: data?.error || 'Update failed' };
      persistUser(data.user);
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: 'Unable to reach server. Ensure backend is running and VITE_API_BASE_URL is configured if API is hosted separately.',
      };
    }
  }, []);

  return <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
