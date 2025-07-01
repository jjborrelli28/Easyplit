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
      const tooltip = document.querySelector("#tooltip");

      if (!tooltip) return;

      const tooltipRect = tooltip.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (placement) {
        case "top":
          top = rect.top - tooltipRect.height - 8;
          left = rect.left + rect.width / 2 - tooltipRect.width / 2;
          break;
        case "bottom":
          top = rect.bottom + 8;
          left = rect.left + rect.width / 2 - tooltipRect.width / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2 - tooltipRect.height / 2;
          left = rect.left - tooltipRect.width - 8;
          break;
        case "right":
          top = rect.top + rect.height / 2 - tooltipRect.height / 2;
          left = rect.right + 8;
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
            id="tooltip"
            className={clsx(
              "animate-fade-in border-h-background fixed z-50 border px-2 py-1 text-xs font-semibold text-wrap shadow-xl transition-opacity",
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
