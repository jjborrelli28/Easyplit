import type { ReactNode, Ref } from "react";

import clsx from "clsx";

import type { Colors } from "../Button";

const BASE_STYLES = "inline-block rounded-full px-3 py-1 group max-w-[200px]";

const COLORS = {
  primary: "bg-primary text-background",
  secondary: "bg-secondary text-background",
  info: "bg-info text-background",
  success: "bg-success text-background",
  warning: "bg-warning text-background",
  danger: "bg-danger text-background",
};
export interface BadgeProps {
  ref?: Ref<HTMLSpanElement>;
  leftItem?: ReactNode;
  children: ReactNode;
  rightItem?: ReactNode;
  color?: Colors;
  className?: string;
}

const Badge = ({
  ref,
  leftItem,
  children,
  rightItem,
  color = "primary",
  className,
}: BadgeProps) => {
  return (
    <span ref={ref} className={clsx(BASE_STYLES, COLORS[color], className)}>
      <span className="flex items-center gap-x-2 truncate overflow-visible text-xs font-semibold">
        {leftItem}

        <span className="truncate">{children}</span>

        {rightItem}
      </span>
    </span>
  );
};

export default Badge;
