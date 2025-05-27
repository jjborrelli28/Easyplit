"use client";

import { useEffect, useState } from "react";

import clsx from "clsx";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();

  const [isMounted, setIsMounted] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    if (isChanging) return;

    setTheme(isDark ? "light" : "dark");
    setIsChanging(true);

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
      <div
        className={clsx(
          "absolute right-1 left-1 flex h-6 w-[calc(100%_-_8px] rounded-full",
          isDark
            ? "animate-justify-start-to-end"
            : "animate-justify-end-to-start",
        )}
      >
        <span
          className={clsx(
            "bg-primary group-hover:bg-primary/90 z-10 h-6 w-6 rounded-full shadow-md transition-colors duration-300 ease-in-out",
            isChanging && "animate-width-pulse",
          )}
        />
      </div>

      <div className="relative z-20 flex w-full justify-between px-1">
        <Sun size={16} className="text-white" />
        <Moon size={16} className="text-black" />
      </div>
    </button>
  );
};

export default ThemeToggle;
