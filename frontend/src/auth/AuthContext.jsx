import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/auth";
import { setUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (credentials) => {
    const loggedIn = await authApi.login(credentials);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const register = useCallback(async (payload) => {
    const created = await authApi.register(payload);
    setUser(created);
    return created;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (changes) => {
    const updated = await authApi.updateProfile(changes);
    setUser(updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, updateProfile }),
    [user, isLoading, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
