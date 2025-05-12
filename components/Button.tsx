"use client";

import type { Url } from "next/dist/shared/lib/router/router";
import Link, { type LinkProps } from "next/link";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import clsx from "clsx";
import Spinner from "./Spinner";

type Variant = "contained" | "outlined";
type Color = "primary" | "secondary" | "danger";

interface BaseProps {
  variant?: Variant;
  color?: Color;
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
  "rounded-md px-4 py-2 font-semibold transition-colors duration-200 flex justify-center items-center gap-3";

const colorStyles: Record<Color, Record<Variant, string>> = {
  primary: {
    contained: "bg-blue-700 text-white hover:bg-blue-600",
    outlined:
      "border border-blue-700 text-white hover:bg-blue-600 hover:border-blue-600",
  },
  secondary: {
    contained: "bg-gray-700 text-white hover:bg-gray-600",
    outlined:
      "border border-gray-700 text-white hover:bg-gray-600 hover:border-gray-600",
  },
  danger: {
    contained: "bg-red-700 text-white hover:bg-red-600",
    outlined:
      "border border-red-700 text-white ed-600 hover:bg-red-600 hover:border-red-600",
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
      className={combinedClass}
      disabled={isDisabled}
      {...(props as ButtonAsButton)}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
};

export default Button;
