"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getPermissions } from "@/lib/api";

const PermissionContext = createContext(null);

// Permission levels
// none → can't access
// view → can see only
// edit → can see + add + edit
// full → can see + add + edit + delete

export function PermissionProvider({ children }) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    if (user.role === "Admin") {
      // Admin has full access to everything
      setPermissions("admin");
      setLoading(false);
      return;
    }
    // Load permissions for agent
    getPermissions().then(res => {
      if (res.success) {
        const myPerm = res.data.find(p => p["Member ID"] === user.id);
        setPermissions(myPerm || null);
      }
      setLoading(false);
    });
  }, [user?.id]);

  const can = (page, action = "view") => {
    if (!permissions) return false;
    if (permissions === "admin") return true;

    const level = permissions[page] || "none";
    if (level === "none")  return false;
    if (level === "view")  return action === "view";
    if (level === "edit")  return action === "view" || action === "add" || action === "edit";
    if (level === "full")  return true;
    return false;
  };

  const canAccess = (page) => can(page, "view");

  return (
    <PermissionContext.Provider value={{ permissions, loading, can, canAccess }}>
      {children}
    </PermissionContext.Provider>
  );
}

export const usePermissions = () => useContext(PermissionContext);
