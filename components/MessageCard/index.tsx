import type { ReactNode } from "react";

import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

import Button, { type Colors } from "../Button";
import Countdown, { type CountdownProps } from "../Countdown";

export interface MessageCardProps {
  color?: Colors;
  icon?: LucideIcon;
  title: ReactNode;
  titleTag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  children: ReactNode | StyledContent[];
  actionLabel?: string;
  onAction?: VoidFunction;
  actionHref?: string;
  containerClassName?: string;
  iconClassName?: string;
  titleClassNAme?: string;
  contentClassName?: string;
  actionClassName?: string;
  countdown?: CountdownProps;
}

const COLORS = {
  primary: { borderColor: "border-primary", titleColor: "text-primary" },
  secondary: { borderColor: "border-secondary", titleColor: "text-secondary" },
  info: { borderColor: "border-info", titleColor: "text-info" },
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
  countdown,
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
            "text-3xl",
            titleTag === "h1" ? "font-bold" : "font-semibold",
            COLORS[color].titleColor,
            titleClassNAme,
          )}
        >
          {title}
        </TitleWrapper>
      </div>

      <Content content={children} className={contentClassName} />

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

      {countdown && (
        <div className="flex justify-center">
          <Countdown {...countdown} />
        </div>
      )}
    </div>
  );
};

export default MessageCard;

const PARAGRAPH_STYLE = {
  base: "text-foreground text-md",
  small: "text-foreground text-sm",
  muted: "text-foreground/75 text-sm",
};

interface StyledContent {
  text: string;
  style?: keyof typeof PARAGRAPH_STYLE;
}

const isStyledContentArray = (content: unknown): content is StyledContent[] => {
  return (
    Array.isArray(content) &&
    content.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "text" in item &&
        typeof item.text === "string",
    )
  );
};

interface ContentProps {
  content: ReactNode | StyledContent[];
  className?: string;
}

const Content = ({ content, className }: ContentProps) => {
  if (!content) return null;

  // If content is a styled content array like StyledContent type
  if (isStyledContentArray(content)) {
    return (
      <div className={clsx("space-y-4", className)}>
        {content.map((item, i) => (
          <p key={i} className={clsx(PARAGRAPH_STYLE[item?.style ?? "base"])}>
            {item.text}
          </p>
        ))}
      </div>
    );
  }

  // If content is string
  if (typeof content === "string") {
    return <p className={className}>{content}</p>;
  }

  // If content is a React node
  return content;
};
