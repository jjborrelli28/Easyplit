import type { ReactNode } from "react";

import clsx from "clsx";
import { X } from "lucide-react";

import type { Colors } from "../Button";
import Button from "../Button";

const BASE_STYLES = "inline-block rounded-full px-3 py-1 group";

const COLORS = {
  primary: "bg-primary text-background",
  secondary: "bg-secondary text-background",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  danger: "bg-danger text-white",
};
export interface BadgeProps {
  children: ReactNode;
  color?: Colors;
  onClick?: VoidFunction;
  className?: string;
}

const Badge = ({
  children,
  color = "primary",
  onClick,
  className,
}: BadgeProps) => {
  return (
    <span className={clsx(BASE_STYLES, COLORS[color], className)}>
      <span className="flex items-center text-xs font-medium">
        {children}

        {!!onClick && (
          <Button
            onClick={onClick}
            unstyled
            className="border-background group-hover:border-background/90 -mr-2 ml-2 cursor-pointer rounded-full pr-1.5 transition-colors duration-300"
          >
            <X className="text-background group-hover:text-background/90 h-2.5 w-2.5 transition-colors duration-300" />
          </Button>
        )}
      </span>
    </span>
  );
};

export default Badge;
