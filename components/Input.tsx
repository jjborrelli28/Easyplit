"use client";

import { useState, type InputHTMLAttributes } from "react";

import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

const Input = ({ label, error, className, ...props }: InputProps) => {
  const [onFocus, setOnFocus] = useState(false);

  const handleFocus = () => {
    setOnFocus((prevState) => !prevState);
  };

  return (
    <fieldset
      className={clsx("relative flex w-full flex-col", label && "pt-7")}
    >
      {label && (
        <label
          htmlFor={props.id || props.name}
          className={clsx(
            "absolute left-0 transform transition-all duration-300",
            onFocus || props?.value
              ? "translate-x-1 -translate-y-6 text-sm"
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
          "w-full rounded-md border bg-gray-800 p-3 text-white placeholder-gray-500 transition duration-300 outline-none focus:ring-1 focus:ring-blue-600",
          label && !onFocus && "placeholder:text-transparent",
          error ? "border-red-500" : "border-transparent",
          className,
        )}
        {...props}
      />

      <div
        className={clsx(
          "grid-rows-auto grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity]",
          error && "grid-rows-[1fr] opacity-100",
        )}
      >
        <div className="overflow-hidden">
          <p className="mt-1 ml-1 text-xs text-red-500">{error}</p>
        </div>
      </div>
    </fieldset>
  );
};

Input.displayName = "Input";

export default Input;
