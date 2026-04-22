import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api.js";

const AuthCtx = createContext(null);

const LS_KEY = "marathon_auth";

function loadStored() {
  try {
    const raw = localStorage.getItem(LS_KEY) || sessionStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => loadStored()?.token ?? "");
  const [user, setUser] = useState(() => loadStored()?.user ?? null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let mounted = true;
    api
      .me(token)
      .then((r) => {
        if (!mounted) return;
        setUser(r.user);
      })
      .catch(() => {
        if (!mounted) return;
        setToken("");
        setUser(null);
        localStorage.removeItem(LS_KEY);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [token]);

  const value = useMemo(() => {
    const persist = (nextToken, nextUser, remember = true) => {
      const storage = remember ? localStorage : sessionStorage;
      const staleStorage = remember ? sessionStorage : localStorage;
      staleStorage.removeItem(LS_KEY);
      storage.setItem(LS_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
    };

    return {
      token,
      user,
      loading,
      async login(emailOrUsername, password, otp, options = {}) {
        const r = await api.login({ identifier: emailOrUsername, password, ...(otp ? { otp } : {}) });
        setToken(r.token);
        setUser(r.user);
        persist(r.token, r.user, options.remember !== false);
        return r;
      },
      setSession(nextToken, nextUser) {
        setToken(nextToken);
        setUser(nextUser);
        persist(nextToken, nextUser);
      },
      async register({ email, password, username, gender, birthDate }) {
        return api.register({ email, password, ...(username ? { username } : {}), ...(gender ? { gender } : {}), ...(birthDate ? { birthDate } : {}) });
      },
      logout() {
        setToken("");
        setUser(null);
        localStorage.removeItem(LS_KEY);
        sessionStorage.removeItem(LS_KEY);
      }
    };
  }, [token, user, loading]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
