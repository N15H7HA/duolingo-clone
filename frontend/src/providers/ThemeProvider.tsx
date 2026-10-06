"use client";

import React, { useEffect } from "react";
import { useMe } from "@/hooks/useDuolingo";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: user } = useMe();

  useEffect(() => {
    // Determine whether dark mode should be enabled:
    // Priority: API user profile setting > LocalStorage > system preference
    let isDark = false;
    if (user && typeof user.dark_mode === "boolean") {
      isDark = user.dark_mode;
      try {
        localStorage.setItem("duolingo_dark_mode", String(isDark));
      } catch {
        // Ignore local storage errors
      }
    } else {
      try {
        const stored = localStorage.getItem("duolingo_dark_mode");
        if (stored !== null) {
          isDark = stored === "true";
        }
      } catch {
        // Ignore
      }
    }

    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.style.colorScheme = "light";
    }
  }, [user?.dark_mode]);

  return <>{children}</>;
}
