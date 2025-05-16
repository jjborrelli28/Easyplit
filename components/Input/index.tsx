"use client";

import { useState, type InputHTMLAttributes } from "react";

import clsx from "clsx";

import Collapse from "../Collapse";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: null | string;
  fullWidth?: boolean;
  className?: string;
}

const Input = ({
  label,
  error,
  fullWidth = true,
  className,
  ...props
}: InputProps) => {
  const [onFocus, setOnFocus] = useState(false);

  const handleFocus = () => {
    setOnFocus((prevState) => !prevState);
  };

  return (
    <fieldset
      className={clsx(
        "relative flex flex-col",
        label && "pt-7",
        fullWidth ? "w-full" : "w-fit",
      )}
    >
      {label && (
        <label
          htmlFor={props.id || props.name}
          className={clsx(
            "absolute left-0 transform font-semibold transition-all duration-300",
            onFocus || props?.value
              ? "text-primary translate-x-1 -translate-y-6 text-sm"
              : "text-md translate-x-3 translate-y-2.5 text-lg",
          )}
        >
          {label}
        </label>
      )}

      <input
        onFocus={handleFocus}
        onBlur={handleFocus}
        className={clsx(
          "text-foreground border-b-foreground focus:border-b-primary w-full border bg-transparent p-3 transition duration-300 outline-none focus:ring-0",
          !label
            ? "placeholder-foreground/50"
            : onFocus
              ? "placeholder-h-background"
              : "placeholder:text-transparent",
          error ? "!border-danger" : "border-transparent",
          className,
        )}
        {...props}
      />

      <Collapse open={!!error}>
        <p className="text-danger mt-1 ml-1 text-xs">{error}</p>
      </Collapse>
    </fieldset>
  );
};

Input.displayName = "Input";

export default Input;
