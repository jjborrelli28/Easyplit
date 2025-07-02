"use client";

import { useEffect, useState } from "react";

import { useTheme } from "next-themes";

import clsx from "clsx";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();

  const [isMounted, setIsMounted] = useState(false);
  const [shouldAnimateOnMount, setShouldAnimateOnMount] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    setShouldAnimateOnMount(true);

    const timer = setTimeout(() => {
      setShouldAnimateOnMount(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    if (isChanging) return;

    setTheme(isDark ? "light" : "dark");
    setIsChanging(true);
    setHasInteracted(true);

    setTimeout(() => {
      setIsChanging(false);
    }, 300);
  };

  return (
    <button
      onClick={handleToggle}
      aria-label="Change theme"
      className="group bg-h-background border-primary relative flex h-8 w-16 cursor-pointer items-center rounded-full border px-1 transition-colors duration-300"
    >
      {isMounted && (
        <div
          className={clsx(
            "absolute right-1 left-1 flex h-6 w-[calc(100%_-_8px)] rounded-full",
            shouldAnimateOnMount && "animate-fade-in",
            isDark ? "justify-end" : "justify-start",
            hasInteracted &&
              (isDark
                ? "animate-justify-start-to-end"
                : "animate-justify-end-to-start"),
          )}
        >
          <span
            className={clsx(
              "bg-primary group-hover:bg-primary/90 z-10 h-6 w-6 rounded-full shadow-md transition-colors duration-300 ease-in-out",
              isChanging && "animate-width-pulse",
            )}
          />
        </div>
      )}

      <div className="relative z-20 flex w-full justify-between px-1">
        <Sun size={16} className="text-white" />

        <Moon size={16} className="text-black" />
      </div>
    </button>
  );
};

export default ThemeToggle;
