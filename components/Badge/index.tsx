import type { ReactNode } from "react";

import clsx from "clsx";

import type { Colors } from "../Button";

export interface BadgeProps {
  children: ReactNode;
  color?: Colors;
  className?: string;
}

const Badge = ({ children, color = "primary", className }: BadgeProps) => {
  const BASE_STYLES =
    "inline-block rounded-full px-3 py-0.5 text-sm font-medium";

  const COLORS = {
    primary: "bg-primary text-background",
    secondary: "bg-secondary text-background",
    success: "bg-success text-white",
    warning: "bg-warning text-white",
    danger: "bg-danger text-white",
  };

  return (
    <span className={clsx(BASE_STYLES, COLORS[color], className)}>
      {children}
    </span>
  );
};

export default Badge;
