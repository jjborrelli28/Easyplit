import type { ReactNode, Ref } from "react";

import clsx from "clsx";
import { X } from "lucide-react";

import type { Colors } from "../Button";
import Button from "../Button";

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
  children: ReactNode;
  color?: Colors;
  onClick?: VoidFunction;
  className?: string;
}

const Badge = ({
  ref,
  children,
  color = "primary",
  onClick,
  className,
}: BadgeProps) => {
  return (
    <span ref={ref} className={clsx(BASE_STYLES, COLORS[color], className)}>
      <span className="flex items-center truncate text-xs font-semibold">
        <span className="truncate">{children}</span>

        {!!onClick && (
          <Button
            onClick={onClick}
            unstyled
            className="border-background group-hover:border-background/90 -mr-2 ml-2 cursor-pointer rounded-full pr-1.5 transition-colors duration-300"
          >
            <X
              strokeWidth={3}
              className="text-background group-hover:text-background/90 h-2.5 w-2.5 transition-colors duration-300"
            />
          </Button>
        )}
      </span>
    </span>
  );
};

export default Badge;
