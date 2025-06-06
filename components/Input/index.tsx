"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
} from "react";

import clsx from "clsx";
import { Pencil, PencilOff } from "lucide-react";

import Button from "../Button";
import Collapse from "../Collapse";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: null | string;
  fullWidth?: boolean;
  editableToggle?: boolean;
  containerClassName?: string;
  className?: string;
  labelClassName?: string;
}

const Input = ({
  label,
  error,
  value: rawValue,
  onChange,
  onFocus: rawOnFocus,
  onBlur,
  fullWidth = true,
  editableToggle = false,
  disabled: rawDisabled = false,
  containerClassName,
  className,
  labelClassName,
  ...props
}: InputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const editableToggleRef = useRef<HTMLButtonElement>(null);

  const [onFocus, setOnFocus] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [internalValue, setInternalValue] = useState(rawValue);

  useEffect(() => {
    if (inputRef.current && isEditing) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    isEditing ? setInternalValue(e.target.value) : onChange?.(e);
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement, Element>) => {
    setOnFocus(true);

    rawOnFocus?.(e);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement, Element>) => {
    if (e.relatedTarget && e.relatedTarget === editableToggleRef.current)
      return;

    setOnFocus(false);

    if (isEditing) {
      setIsEditing(false);
      setInternalValue(rawValue);

      const syntheticEvent = {
        target: {
          value: rawValue,
          name: props.name,
        },
      } as ChangeEvent<HTMLInputElement>;

      onChange?.(syntheticEvent);
    }

    onBlur?.(e);
  };

  const handleEditableToggle = () => {
    if (isEditing) {
      const syntheticEvent = {
        target: {
          value: internalValue,
          name: props.name,
        },
      } as ChangeEvent<HTMLInputElement>;

      setIsEditing(false);
      setOnFocus(false);

      onChange?.(syntheticEvent);
    } else {
      setIsEditing(true);
    }
  };

  const value = editableToggle && isEditing ? internalValue : rawValue;
  const disabled = editableToggle ? !isEditing : rawDisabled;

  return (
    <fieldset
      className={clsx(
        "relative flex flex-col",
        label && "pt-7",
        fullWidth ? "w-full" : "w-fit",
        containerClassName,
      )}
    >
      {label && (
        <label
          htmlFor={props.id || props.name}
          className={clsx(
            "absolute left-0 transform font-semibold transition-all duration-300",
            onFocus || !!value
              ? "text-primary translate-x-1 -translate-y-6 text-sm"
              : "text-md translate-x-3 translate-y-2.5 text-lg",
            disabled && "!text-foreground",
            editableToggle && !disabled && "animate-color-pulse",
            labelClassName,
          )}
        >
          {label}
        </label>
      )}

      <div className="flex items-center">
        <input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={clsx(
            "text-foreground !border-b-foreground focus:!border-b-primary w-full border border-transparent bg-transparent p-3 transition duration-300 outline-none focus:ring-0",
            !label
              ? "placeholder-foreground/50"
              : onFocus
                ? "placeholder-h-background"
                : "placeholder:text-transparent",
            error ? "!border-b-danger" : "border-b-transparent",
            editableToggle && "!pr-0",
            editableToggle && !disabled && "animate-border-bottom-color-pulse",
            disabled && "border-b-transparent",
            className,
          )}
          {...props}
        />

        {editableToggle && (
          <Button
            ref={editableToggleRef}
            onClick={handleEditableToggle}
            unstyled
            className="mx-3 cursor-pointer"
          >
            {isEditing ? (
              <PencilOff className="animate-color-pulse transition-colors duration-300" />
            ) : (
              <Pencil className="hover:text-primary transition-colors duration-300" />
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
