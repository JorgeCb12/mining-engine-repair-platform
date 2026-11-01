import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";
import type { User } from "../types";

interface JwtClaims {
  sub?: unknown;
  email?: unknown;
  role?: unknown;
  exp?: unknown;
}

const decodeUser = (token: string): User => {
  const claims = jwtDecode<JwtClaims>(token);
  if (
    typeof claims.sub !== "string" ||
    typeof claims.email !== "string" ||
    typeof claims.role !== "string" ||
    typeof claims.exp !== "number" ||
    !Number.isFinite(claims.exp) ||
    claims.exp * 1000 <= Date.now()
  ) {
    throw new Error("Token JWT inválido o expirado");
  }

  return {
    id: claims.sub,
    email: claims.email,
    role: claims.role,
  };
};

const getInitialToken = (): string | null => {
  localStorage.removeItem("user");
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    decodeUser(token);
    return token;
  } catch {
    localStorage.removeItem("token");
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(getInitialToken);
  const user = useMemo(() => {
    if (!token) return null;
    try {
      return decodeUser(token);
    } catch {
      return null;
    }
  }, [token]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
  }, []);

  const login = (newToken: string) => {
    decodeUser(newToken);
    localStorage.setItem("token", newToken);
    localStorage.removeItem("user");
    setToken(newToken);
  };

  useEffect(() => {
    if (!token) return;

    try {
      const { exp } = jwtDecode<JwtClaims>(token);
      if (typeof exp !== "number" || !Number.isFinite(exp)) {
        throw new Error("Token JWT inválido");
      }

      const timeoutId = window.setTimeout(
        logout,
        Math.max(0, exp * 1000 - Date.now()),
      );
      return () => window.clearTimeout(timeoutId);
    } catch {
      const timeoutId = window.setTimeout(logout, 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
