import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "harvi-sidebar-collapsed";

export function useSidebarCollapsed() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isCollapsed));
    } catch {
      // ignore storage errors
    }
  }, [isCollapsed]);

  const toggle = useCallback(() => setIsCollapsed((prev) => !prev), []);

  return { isCollapsed, toggle, setIsCollapsed };
}
