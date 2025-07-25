"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import clsx from "clsx";
import { Eye, EyeOff, Pencil, PencilOff } from "lucide-react";

import Button from "../Button";
import InputErrorMessage from "../InputErrorMessage";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: null | string;
  fullWidth?: boolean;
  editableToggle?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  className?: string;
  errorClassName?: string;
  rightItem?: ReactNode;
}

const Input = ({
  label,
  error,
  type,
  value: rawValue,
  onChange,
  onFocus: rawOnFocus,
  onBlur,
  fullWidth = true,
  editableToggle = false,
  disabled: rawDisabled = false,
  containerClassName,
  labelClassName,
  className,
  errorClassName,
  rightItem,
  ...props
}: InputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const showPasswordRef = useRef<HTMLButtonElement>(null);
  const editableToggleRef = useRef<HTMLButtonElement>(null);

  const [onFocus, setOnFocus] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [internalValue, setInternalValue] = useState(rawValue);

  useEffect(() => {
    setInternalValue(rawValue);
  }, [rawValue]);

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (inputRef.current && isEditing) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = e.target.value.replace(/^\s+/, "");

    if (isEditing) {
      setInternalValue(sanitizedValue);
    } else {
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: sanitizedValue,
        },
      };

      onChange?.(syntheticEvent as ChangeEvent<HTMLInputElement>);
    }
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement, Element>) => {
    setOnFocus(true);

    rawOnFocus?.(e);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement, Element>) => {
    if (
      e.relatedTarget &&
      (e.relatedTarget === editableToggleRef.current ||
        e.relatedTarget === showPasswordRef.current)
    )
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

  const handleShowPasswordToggle = () => {
    setShowPassword((prevState) => !prevState);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (editableToggle && isEditing && e.key === "Enter") {
      e.preventDefault();

      handleEditableToggle();
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

      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type={type === "password" ? (showPassword ? "text" : type) : type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={clsx(
            "text-foreground !border-b-foreground focus:!border-b-primary w-full border border-transparent bg-transparent p-3 transition duration-300 outline-none focus:ring-0",
            type === "password"
              ? editableToggle
                ? "pr-12"
                : "pr-12"
              : editableToggle
                ? "pr-0"
                : "pr-3",
            !label
              ? "placeholder-foreground/50"
              : onFocus
                ? "placeholder-h-background"
                : "placeholder:text-transparent",
            error ? "!border-b-danger" : "border-b-transparent",
            editableToggle && !disabled && "animate-border-bottom-color-pulse",
            disabled && "border-b-transparent",
            className,
          )}
          {...props}
        />

        {rightItem && !editableToggle && type !== "password" && rightItem}

        {((type === "password" && !editableToggle) ||
          (type === "password" && editableToggle && isEditing)) && (
          <div className="bg-background absolute top-1/2 right-0 flex max-h-[48px] -translate-y-1/2 p-3 pt-3.5">
            <Button
              ref={showPasswordRef}
              aria-label="Toggle show password"
              onClick={handleShowPasswordToggle}
              unstyled
              className={clsx(
                "text-foreground hover:text-primary cursor-pointer transition-colors duration-300",
                editableToggle && "right-15",
              )}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </Button>{" "}
          </div>
        )}

        {editableToggle && (
          <div className="bg-background absolute top-1/2 right-0 flex max-h-[48px] -translate-y-1/2 p-3 pt-3.5">
            <Button
              ref={editableToggleRef}
              aria-label="Toggle edit input"
              onClick={handleEditableToggle}
              unstyled
              className="cursor-pointer"
            >
              {isEditing ? (
                <PencilOff className="animate-color-pulse transition-colors duration-300" />
              ) : (
                <Pencil className="hover:text-primary transition-colors duration-300" />
              )}
            </Button>
          </div>
        )}
      </div>

      <InputErrorMessage message={error} className={errorClassName} />
    </fieldset>
  );
};

Input.displayName = "Input";

export default Input;
