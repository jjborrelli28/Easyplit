"use client";

import type { Url } from "next/dist/shared/lib/router/router";
import Link, { type LinkProps } from "next/link";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import clsx from "clsx";
import Spinner from "./Spinner";

type Variants = "contained" | "outlined";
export type Colors =
  | "primary"
  | "secondary"
  | "tertiary"
  | "success"
  | "warning"
  | "danger";

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

type ButtonProps = PropsWithChildren<ButtonAsButton | ButtonAsLink>;

const baseStyles =
  " px-4 py-2 font-semibold transition-colors duration-200 flex justify-center items-center gap-3";

const colorStyles: Record<Colors, Record<Variants, string>> = {
  primary: {
    contained: "bg-primary text-white hover:bg-primary/90",
    outlined:
      "border border-primary text-primary hover:bg-primary hover:text-white",
  },
  secondary: {
    contained: "bg-secondary text-white hover:bg-secondary/90",
    outlined:
      "border border-secondary text-secondary hover:bg-secondary hover:border-secondary hover:text-white",
  },
  tertiary: {
    contained:
      "bg-black text-white hover:bg-black/90 dark:border-black dark:border",
    outlined:
      "border border-foreground text-foreground hover:bg-foreground hover:text-background",
  },
  success: {
    contained: "bg-success text-white hover:bg-success/90",
    outlined:
      "border border-success text-success hover:bg-success hover:text-white",
  },
  warning: {
    contained: "bg-warning text-white hover:bg-warning/90",
    outlined:
      "border border-warning text-warning hover:bg-warning hover:text-white",
  },
  danger: {
    contained: "bg-danger text-white hover:bg-danger/90",
    outlined:
      "border border-danger text-danger hover:bg-danger hover:text-white",
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
      baseStyles,
      colorStyles[color][variant],
      fullWidth ? "w-full" : "w-fit",
      loading && "pointer-events-none",
      disabled ? "cursor-not-allowed" : "cursor-pointer",
    ],
    className,
  );

  const isDisabled = disabled || loading;
  const spinnerColor = variant === "contained" ? "white" : color;

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
      {loading ? <Spinner color={spinnerColor} /> : children}
    </button>
  );
};

export default Button;
