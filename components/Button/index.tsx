"use client";

import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import type { Url } from "next/dist/shared/lib/router/router";
import Link, { type LinkProps } from "next/link";

import clsx from "clsx";

import Spinner from "../Spinner";

type Variants = "contained" | "outlined";
export type Colors = "primary" | "secondary" | "success" | "warning" | "danger";

interface BaseProps {
  variant?: Variants;
  color?: Colors;
  fullWidth?: boolean;
  unstyled?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

interface ButtonAsLink extends BaseProps, LinkProps {
  className?: string;
}

interface ButtonAsButton
  extends BaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  href?: Url;
}

export type ButtonProps = PropsWithChildren<ButtonAsButton | ButtonAsLink>;

const BASE_STYLES =
  "relative box-border flex min-w-[80px] items-center justify-center gap-3 px-4 py-2 font-semibold transition-colors duration-300";

const COLORS: Record<Colors, Record<Variants, string>> = {
  primary: {
    contained: "bg-primary text-background hover:bg-primary/90",
    outlined:
      "border border-primary text-primary hover:bg-primary hover:text-background",
  },
  secondary: {
    contained: "bg-secondary text-background hover:bg-secondary/90",
    outlined:
      "border border-secondary text-secondary hover:bg-secondary hover:text-background",
  },
  success: {
    contained: "bg-success text-background hover:bg-success/90",
    outlined:
      "border border-success text-success hover:bg-success hover:text-background",
  },
  warning: {
    contained: "bg-warning text-background hover:bg-warning/90",
    outlined:
      "border border-warning text-warning hover:bg-warning hover:text-background",
  },
  danger: {
    contained: "bg-danger text-background hover:bg-danger/90",
    outlined:
      "border border-danger text-danger hover:bg-danger hover:text-background",
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
      fullWidth ? "w-full" : "w-fit",
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
