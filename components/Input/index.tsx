"use client";

import { useState, type InputHTMLAttributes } from "react";

import clsx from "clsx";
import { Pencil, PencilOff } from "lucide-react";

import Button from "../Button";
import Collapse from "../Collapse";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: null | string;
  fullWidth?: boolean;
  editableToggle?: boolean;
  className?: string;
}

const Input = ({
  label,
  error,
  fullWidth = true,
  editableToggle = false,
  disabled: rawDisabled = false,
  className,
  ...props
}: InputProps) => {
  const [onFocus, setOnFocus] = useState(false);
  const [internalDisabled, setInternalDisabled] = useState(true);

  const handleFocus = () => {
    setOnFocus((prevState) => !prevState);
  };

  const handleEditableToggle = () =>
    setInternalDisabled((prevState) => !prevState);

  const disabled = editableToggle ? internalDisabled : rawDisabled;

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
            disabled && "!text-foreground",
            editableToggle && !disabled && "animate-color-pulse",
          )}
        >
          {label}
        </label>
      )}

      <div className="flex items-center">
        <input
          onFocus={handleFocus}
          onBlur={handleFocus}
          disabled={disabled}
          className={clsx(
            "text-foreground border-b-foreground focus:border-b-primary w-full border bg-transparent p-3 transition duration-300 outline-none focus:ring-0",
            !label
              ? "placeholder-foreground/50"
              : onFocus
                ? "placeholder-h-background"
                : "placeholder:text-transparent",
            error ? "!border-danger" : "border-transparent",
            editableToggle && "!pr-0",
            editableToggle && !disabled && "animate-border-bottom-color-pulse",
            disabled && "border-b-transparent",
            className,
          )}
          {...props}
        />

        {editableToggle && (
          <Button
            onClick={handleEditableToggle}
            unstyled
            className="mx-3 cursor-pointer"
          >
            {internalDisabled ? (
              <Pencil className="hover:text-primary transition-colors duration-300" />
            ) : (
              <PencilOff className="animate-color-pulse transition-colors duration-300" />
            )}
          </Button>
        )}
      </div>

      <Collapse isOpen={!!error}>
        <p className="text-danger mt-1 ml-1 text-start text-xs">{error}</p>
      </Collapse>
    </fieldset>
  );
};

Input.displayName = "Input";

export default Input;
