"use client";

import { type ReactNode, useCallback, useEffect, useState } from "react";

import clsx from "clsx";
import { X } from "lucide-react";

import Button, { type Colors } from "../Button";

export interface SnackbarProps {
  color?: Colors;
  duration?: number;
  onClose: VoidFunction;
  children: ReactNode;
  className?: string;
}

const COLORS: Record<Colors, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

// Must match the `duration-300` transition below so the element is only
// unmounted (via onClose) once the exit transition has actually finished.
const EXIT_DURATION = 300;

const Snackbar = ({
  color = "primary",
  duration = 4000,
  onClose,
  children,
  className,
}: SnackbarProps) => {
  const [entered, setEntered] = useState(false);
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => setClosing(true), []);

  // Start hidden, then flip on the next frame so the transition to the
  // visible state actually plays instead of snapping in immediately.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));

    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (duration <= 0) return;

    const timeout = setTimeout(handleClose, duration);

    return () => clearTimeout(timeout);
  }, [duration, handleClose]);

  useEffect(() => {
    if (!closing) return;

    const timeout = setTimeout(onClose, EXIT_DURATION);

    return () => clearTimeout(timeout);
  }, [closing, onClose]);

  const isShown = entered && !closing;

  return (
    <div
      role="status"
      className={clsx(
        "flex w-full max-w-sm items-center gap-x-4 p-4 shadow-xl transition-all duration-300",
        isShown ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0",
        COLORS[color],
        className,
      )}
    >
      <p className="text-background flex-1 text-sm font-semibold">{children}</p>

      <Button
        aria-label="Cerrar notificación"
        onClick={handleClose}
        unstyled
        className="text-background hover:text-background/90 cursor-pointer transition-colors duration-300"
      >
        <X className="h-4 w-4 stroke-3" />
      </Button>
    </div>
  );
};

export default Snackbar;
