import React from 'react';

type AuthUser = {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  role?: 'USER' | 'SUPERADMIN';
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
const API = '/api/auth';
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

  const getUserFromResponse = (payload: any): AuthUser | null => {
    if (!payload || typeof payload !== 'object') return null;
    return payload.user ?? payload.data?.user ?? null;
  };

  const getErrorFromResponse = (payload: any, fallback: string) => {
    return payload?.message || payload?.error || fallback;
  };

  const login = React.useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/login`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await readResponseBody(res);
      if (!res.ok) return { ok: false, error: getErrorFromResponse(data, 'Login failed') };
      const loggedInUser = getUserFromResponse(data);
      if (!loggedInUser) return { ok: false, error: 'Login failed: invalid server response' };
      persistUser(loggedInUser);
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: 'Unable to reach server. Ensure backend is running and reachable.',
      };
    }
    finally { setLoading(false); }
  }, []);

  const register = React.useCallback(async (payload) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/register`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await readResponseBody(res);
      if (!res.ok) return { ok: false, error: getErrorFromResponse(data, 'Registration failed') };
      const registeredUser = getUserFromResponse(data);
      if (!registeredUser) return { ok: false, error: 'Registration failed: invalid server response' };
      persistUser(registeredUser);
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: 'Unable to reach server. Ensure backend is running and reachable.',
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
      if (!res.ok) return { ok: false, error: getErrorFromResponse(data, 'Update failed') };
      const updatedUser = getUserFromResponse(data);
      if (!updatedUser) return { ok: false, error: 'Update failed: invalid server response' };
      persistUser(updatedUser);
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: 'Unable to reach server. Ensure backend is running and reachable.',
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
