"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import clsx from "clsx";

export type Colors =
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "danger";

const COLOR_MAP: Record<Colors, string> = {
  primary: "bg-primary text-background",
  secondary: "bg-secondary text-background",
  info: "bg-info text-background",
  success: "bg-success text-background",
  warning: "bg-warning text-background",
  danger: "bg-danger text-background",
};

interface TooltipProps {
  children: ReactNode;
  content: string;
  color?: Colors;
  placement?: "top" | "bottom" | "left" | "right";
  className?: string;
  containerClassName?: string;
}

const Tooltip = ({
  children,
  content,
  color = "primary",
  placement = "top",
  className,
  containerClassName,
}: TooltipProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    if (!visible) return;

    const updatePosition = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const tooltipWidth = rect.width;
      const tooltipHeight = rect.height;

      let top = rect.top;
      let left = rect.left;

      switch (placement) {
        case "top":
          top -= tooltipHeight + 8;
          left += rect.width / 2 - tooltipWidth / 2;
          break;
        case "bottom":
          top += rect.height + 8;
          left += rect.width / 2 - tooltipWidth / 2;
          break;
        case "left":
          top += rect.height / 2 - tooltipHeight / 2;
          left -= tooltipWidth + 8;
          break;
        case "right":
          top += rect.height / 2 - tooltipHeight / 2;
          left += rect.width + 8;
          break;
      }

      setPosition({ top, left });
    };

    updatePosition();

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [visible, placement]);

  return (
    <>
      <div
        ref={ref}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className={clsx("inline-flex", containerClassName)}
      >
        {children}
      </div>

      {visible &&
        createPortal(
          <div
            className={clsx(
              "border-h-background animate-fade-in fixed z-50 border px-2 py-1 text-xs font-semibold text-wrap shadow-xl transition-opacity",
              COLOR_MAP[color],
              className,
            )}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
};

export default Tooltip;
