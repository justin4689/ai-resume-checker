import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (creds: { email?: string; password?: string }) => Promise<User>;
  register: (payload: { name?: string; email?: string; password?: string }) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (payload: Partial<User>) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const refresh = useCallback(async () => {
    try {
      const { user } = await authApi.me();
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (credentials: { email?: string; password?: string }): Promise<User> => {
    const { user } = await authApi.login(credentials);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (payload: { name?: string; email?: string; password?: string }): Promise<User> => {
    const { user } = await authApi.register(payload);
    setUser(user);
    return user;
  }, []);

  const updateProfile = useCallback(async (payload: Partial<User>): Promise<User> => {
    const { user } = await authApi.updateProfile(payload);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      queryClient.clear();
    }
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
