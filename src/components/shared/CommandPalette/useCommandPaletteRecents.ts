import { useState, useEffect } from "react";
import { PAGE_TITLE_MAP } from "./commandPaletteConfig";

const STORAGE_KEY = "harvi-recent-pages";

export function useCommandPaletteRecents() {
  const [recents, setRecents] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const name = PAGE_TITLE_MAP[path];
      if (name) {
        setRecents((prev) => {
          const next = [name, ...prev.filter((item) => item !== name)].slice(0, 5);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      }
    };
    handleLocationChange();
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  return recents;
}
