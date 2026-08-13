"use client";

import { createContext, type ReactNode, useCallback, useState } from "react";

import type { Colors } from "@/components/Button";
import Snackbar from "@/components/Snackbar";

interface SnackbarItem {
  id: string;
  message: string;
  color: Colors;
  duration: number;
}

interface ShowSnackbarOptions {
  color?: Colors;
  duration?: number;
}

interface SnackbarContextValue {
  showSnackbar: (message: string, options?: ShowSnackbarOptions) => void;
}

export const SnackbarContext = createContext<SnackbarContextValue | null>(
  null,
);

interface SnackbarProviderProps {
  children: ReactNode;
}

const SnackbarProvider = ({ children }: SnackbarProviderProps) => {
  const [snackbars, setSnackbars] = useState<SnackbarItem[]>([]);

  const removeSnackbar = useCallback((id: string) => {
    setSnackbars((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const showSnackbar = useCallback(
    (message: string, options?: ShowSnackbarOptions) => {
      const id = `snackbar-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      setSnackbars((prev) => [
        ...prev,
        {
          id,
          message,
          color: options?.color ?? "primary",
          duration: options?.duration ?? 4000,
        },
      ]);
    },
    [],
  );

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}

      <div className="fixed right-4 bottom-4 z-[100] flex flex-col gap-y-3">
        {snackbars.map((snackbar) => (
          <Snackbar
            key={snackbar.id}
            color={snackbar.color}
            duration={snackbar.duration}
            onClose={() => removeSnackbar(snackbar.id)}
          >
            {snackbar.message}
          </Snackbar>
        ))}
      </div>
    </SnackbarContext.Provider>
  );
};

export default SnackbarProvider;
