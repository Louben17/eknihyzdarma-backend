"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { strapiLogin, strapiRegister, strapiMe, type AuthUser } from "@/lib/auth";

const JWT_KEY = "eknihy_jwt";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithToken: (jwt: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Načíst JWT z localStorage při startu
  useEffect(() => {
    const savedToken = localStorage.getItem(JWT_KEY);
    if (savedToken) {
      strapiMe(savedToken)
        .then((userData) => {
          setUser(userData);
          setToken(savedToken);
        })
        .catch(() => {
          localStorage.removeItem(JWT_KEY);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { jwt, user: userData } = await strapiLogin(email, password);
    localStorage.setItem(JWT_KEY, jwt);
    setToken(jwt);
    setUser(userData);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const { jwt, user: userData } = await strapiRegister(email, password);
    localStorage.setItem(JWT_KEY, jwt);
    setToken(jwt);
    setUser(userData);
  }, []);

  const loginWithToken = useCallback(async (jwt: string) => {
    const userData = await strapiMe(jwt);
    localStorage.setItem(JWT_KEY, jwt);
    setToken(jwt);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(JWT_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth musí být použit uvnitř AuthProvider");
  return ctx;
}
