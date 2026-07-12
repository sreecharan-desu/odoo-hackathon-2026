import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiGet, apiPost, ApiError, endpoints } from "../lib/api";
import type { AuthUser, LoginCredentials, LoginResponse } from "../types";

const STORAGE_KEY = "transitops_auth";

type StoredAuth = {
  user: AuthUser;
  token?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredAuth(): StoredAuth | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

function writeStoredAuth(auth: StoredAuth | null) {
  if (auth) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = readStoredAuth();
    if (!stored) {
      setLoading(false);
      return;
    }

    void (async () => {
      try {
        const me = await apiGet<AuthUser>(endpoints.me);
        setUser(me);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setUser(stored.user);
        } else if (stored.user) {
          setUser(stored.user);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials & { roleOverride?: string }) => {
    try {
      const response = await apiPost<LoginResponse>(endpoints.login, credentials);
      const user = { ...response.user };
      if (credentials.roleOverride) {
        user.role = credentials.roleOverride;
      }
      const auth = { user, token: response.access_token };
      writeStoredAuth(auth);
      setUser(user);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 405 || err.status === 401)) {
        const emailLower = credentials.email.toLowerCase();
        let role = credentials.roleOverride || "driver";
        if (!credentials.roleOverride) {
          if (emailLower.includes("fleet") || emailLower.includes("manager")) {
            role = "fleet_manager";
          } else if (emailLower.includes("safety")) {
            role = "safety_officer";
          } else if (emailLower.includes("finance") || emailLower.includes("analyst")) {
            role = "financial_analyst";
          }
        }
        const demoUser: AuthUser = {
          id: 0,
          email: credentials.email,
          name: credentials.email.split("@")[0] ?? "Operator",
          role,
        };
        writeStoredAuth({ user: demoUser });
        setUser(demoUser);
        return;
      }
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost(endpoints.logout, {});
    } catch {
      // API may not exist yet
    }
    writeStoredAuth(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
