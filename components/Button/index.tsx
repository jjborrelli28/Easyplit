"use client";

import type { ButtonHTMLAttributes, PropsWithChildren, Ref } from "react";

import type { Url } from "next/dist/shared/lib/router/router";
import Link, { type LinkProps } from "next/link";

import clsx from "clsx";

import Spinner from "../Spinner";

type Variant = "contained" | "outlined" | "text";
export type Colors =
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "danger";

interface BaseProps {
  variant?: Variant;
  color?: Colors;
  fullWidth?: boolean;
  unstyled?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

interface ButtonAsLink extends BaseProps, LinkProps {
  ref?: Ref<HTMLAnchorElement>;
  className?: string;
}

interface ButtonAsButton
  extends BaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  ref?: Ref<HTMLButtonElement>;
  href?: Url;
}

export type ButtonProps = PropsWithChildren<ButtonAsButton | ButtonAsLink>;

const BASE_STYLES =
  "relative box-border flex min-w-30 items-center justify-center gap-3 px-4 py-2 font-semibold transition-colors duration-300";

const COLORS: Record<Colors, Record<Variant, string>> = {
  primary: {
    contained: "bg-primary text-background hover:bg-primary/90",
    outlined:
      "border border-primary text-primary hover:bg-primary hover:text-background",
    text: "text-primary hover:text-primary/90",
  },
  secondary: {
    contained: "bg-secondary text-background hover:bg-secondary/90",
    outlined:
      "border border-secondary text-secondary hover:bg-secondary hover:text-background",
    text: "text-secondary hover:text-secondary/90",
  },
  info: {
    contained: "bg-info text-background hover:bg-info/90",
    outlined:
      "border border-info text-info hover:bg-info hover:text-background",
    text: "text-info hover:text-info/90",
  },
  success: {
    contained: "bg-success text-background hover:bg-success/90",
    outlined:
      "border border-success text-success hover:bg-success hover:text-background",
    text: "text-success hover:text-success/90",
  },
  warning: {
    contained: "bg-warning text-background hover:bg-warning/90",
    outlined:
      "border border-warning text-warning hover:bg-warning hover:text-background",
    text: "text-warning hover:text-warning/90",
  },
  danger: {
    contained: "bg-danger text-background hover:bg-danger/90",
    outlined:
      "border border-danger text-danger hover:bg-danger hover:text-background",
    text: "text-danger hover:text-danger/90",
  },
};

const Button = ({
  variant = "contained",
  color = "primary",
  className,
  fullWidth,
  unstyled,
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  const combinedClass = clsx(
    !unstyled && [
      BASE_STYLES,
      COLORS[color][variant],
      fullWidth ? "w-full" : "max-w-fit",
      loading && "pointer-events-none text-transparent",
      disabled ? "cursor-not-allowed" : "cursor-pointer",
    ],
    className,
  );

  const isDisabled = disabled || loading;

  if (props?.href) {
    return (
      <Link className={combinedClass} {...(props as ButtonAsLink)}>
        {children}
      </Link>
    );
  }

  return (
    <button
      aria-hidden={loading ? "true" : "false"}
      className={combinedClass}
      disabled={isDisabled}
      {...(props as ButtonAsButton)}
    >
      {loading && (
        <Spinner
          color={variant === "contained" ? "background" : color}
          className="absolute"
        />
      )}

      {children}
    </button>
  );
};

export default Button;
