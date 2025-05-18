import type { ReactNode } from "react";

import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

import Button, { type Colors } from "../Button";

interface MessageCardProps {
  color?: Colors;
  icon: LucideIcon;
  title: ReactNode;
  children: ReactNode;
  actionLabel?: string;
  onAction?: VoidFunction;
  actionHref?: string;
  containerClassName?: string;
  iconClassName?: string;
  titleClassNAme?: string;
  contentClassName?: string;
  actionClassName?: string;
}

const COLORS = {
  primary: { borderColor: "border-primary", titleColor: "text-primary" },
  secondary: { borderColor: "border-secondary", titleColor: "text-secondary" },
  success: { borderColor: "border-success", titleColor: "text-success" },
  warning: { borderColor: "border-warning", titleColor: "text-warning" },
  danger: { borderColor: "border-danger", titleColor: "text-danger" },
};

const MessageCard = ({
  color = "primary",
  icon: Icon,
  title,
  children,
  actionLabel,
  actionHref,
  onAction,
  containerClassName,
  iconClassName,
  titleClassNAme,
  contentClassName,
  actionClassName,
}: MessageCardProps) => {
  const hasAction = actionLabel && (actionHref || onAction);

  return (
    <div
      className={clsx(
        "w-full max-w-md space-y-8 border p-8 text-center shadow-xl",
        COLORS[color].borderColor,
        containerClassName,
      )}
    >
      <div className="flex flex-col items-center gap-y-8">
        <Icon
          className={clsx(
            "mx-auto h-12 w-12",
            COLORS[color].titleColor,
            iconClassName,
          )}
        />

        <h1
          className={clsx(
            "text-3xl font-semibold",
            COLORS[color].titleColor,
            titleClassNAme,
          )}
        >
          {title}
        </h1>
      </div>

      <p className={contentClassName}>{children}</p>

      {hasAction && (
        <Button
          color={color}
          {...(actionHref ? { href: actionHref } : { onClick: onAction })}
          className={actionClassName}
          fullWidth
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default MessageCard;
