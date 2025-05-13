"use client";

import { useEffect } from "react";

const ThemeInitializer = () => {
  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const hasPreference =
      window.matchMedia("(prefers-color-scheme)").media !== "not all";

    const root = document.documentElement;

    if (hasPreference) {
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    } else {
      root.classList.add("dark"); // Default theme
    }
  }, []);

  return null;
};

export default ThemeInitializer;
