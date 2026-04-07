"use client";
import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = Cookies.get("ofm_user");
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    Cookies.set("ofm_user", JSON.stringify(userData), { expires: 7 });
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("ofm_user");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
