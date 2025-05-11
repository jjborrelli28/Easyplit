"use client";

import type { Url } from "next/dist/shared/lib/router/router";
import Link, { type LinkProps } from "next/link";
import type { ButtonHTMLAttributes } from "react";

import clsx from "clsx";

type Variant = "contained" | "outlined";
type Color = "primary" | "secondary" | "danger";

interface BaseProps {
  variant?: Variant;
  color?: Color;
  fullWidth?: boolean;
  unstyled?: boolean;
}

interface ButtonAsLink extends BaseProps, LinkProps {
  className?: string;
}

interface ButtonAsButton
  extends BaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  href?: Url;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const baseStyles =
  "rounded-md px-4 py-2 font-semibold transition-colors duration-200 cursor-pointer flex justify-center items-center gap-3";

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
  ...props
}: ButtonProps) => {
  const combinedClass = clsx(
    !unstyled && [
      baseStyles,
      colorStyles[color][variant],
      fullWidth && "w-full",
    ],
    className,
  );

  if (props?.href) {
    return <Link className={combinedClass} {...(props as ButtonAsLink)} />;
  }

  return <button className={combinedClass} {...(props as ButtonAsButton)} />;
};

export default Button;
