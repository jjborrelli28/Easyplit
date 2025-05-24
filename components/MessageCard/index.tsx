import type { ReactNode } from "react";

import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

import Button, { type Colors } from "../Button";

export interface MessageCardProps {
  color?: Colors;
  icon?: LucideIcon;
  title: ReactNode;
  titleTag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
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
  titleTag = "h2",
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
  const TitleWrapper = titleTag;
  const hasAction = actionLabel && (actionHref || onAction);

  return (
    <div
      className={clsx(
        "w-full max-w-md space-y-8 border p-8 text-center shadow-xl",
        COLORS[color].borderColor,
        containerClassName,
      )}
    >
      <div className="flex flex-col items-center gap-y-4">
        {Icon && (
          <Icon
            className={clsx(
              "mx-auto h-12 w-12",
              COLORS[color].titleColor,
              iconClassName,
            )}
          />
        )}

        <TitleWrapper
          className={clsx(
            "text-3xl font-semibold",
            COLORS[color].titleColor,
            titleClassNAme,
          )}
        >
          {title}
        </TitleWrapper>
      </div>

      {typeof children === "string" ? (
        <p className={contentClassName}>{children}</p>
      ) : (
        children
      )}

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
