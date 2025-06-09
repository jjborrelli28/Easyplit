"use client";

import { useEffect, useState } from "react";

import clsx from "clsx";

import Spinner, { type SpinnerProps } from "../Spinner";

export interface CountdownProps extends SpinnerProps {
  start: number;
  onComplete?: VoidFunction;
}

const COLORS = {
  black: "text-black",
  white: "text-white",
  background: "text-background",
  foreground: "text-foreground",
  primary: "text-primary",
  secondary: "text-secondary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

const Countdown = ({ start, onComplete, ...restProps }: CountdownProps) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (start <= 0) return;

    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);

          setTimeout(() => {
            onComplete?.();
          }, 0);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [start, onComplete]);

  return (
    <div className="relative h-12 w-12">
      <Spinner className="h-12 w-12" {...restProps} />

      <span
        className={clsx(
          "absolute top-1/2 left-1/2 max-w-8 -translate-x-1/2 -translate-y-1/2 font-semibold",
          COLORS[restProps?.color ?? "primary"],
        )}
      >
        {count}
      </span>
    </div>
  );
};

export default Countdown;
