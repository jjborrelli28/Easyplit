import { type ReactNode, useEffect, useState } from "react";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";

import Button, { type Colors } from "../Button";
import Collapse from "../Collapse";

const COLORS = {
  label: {
    primary: "text-primary",
    secondary: "text-secondary",
    info: "text-info",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
  },
  ["chevron-button"]: {
    primary: "hover:text-primary",
    secondary: "hover:text-secondary",
    info: "hover:text-info",
    success: "hover:text-success",
    warning: "hover:text-warning",
    danger: "hover:text-danger",
  },
  border: {
    primary: "border-primary",
    secondary: "border-secondary",
    info: "border-info",
    success: "border-success",
    warning: "border-warning",
    danger: "border-danger",
  },
  option: {
    primary: "hover:bg-primary hover:text-background",
    secondary: "hover:bg-secondary hover:text-background",
    info: "hover:bg-info hover:text-background",
    success: "hover:bg-success hover:text-background",
    warning: "hover:bg-warning hover:text-background",
    danger: "hover:bg-danger hover:text-background",
  },
};

interface SelectOption {
  value: string;
  label: ReactNode;
}

interface SelectProps {
  color?: Colors;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  className?: string;
}

const Select = ({
  color = "primary",
  options: rawOptions,
  value,
  onChange,
  label,
  placeholder = "Seleccioná una opción",
  disabled = false,
  containerClassName,
  labelClassName,
  className,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stillExists = rawOptions.some((opt) => opt.value === value);

    if (!stillExists && value) {
      onChange("");
    }
  }, [rawOptions, value, onChange]);

  const selectedOption = rawOptions.find((option) => option.value === value);
  const options = rawOptions.filter(
    (option) => option.value !== selectedOption?.value,
  );
  const noOptions = !options.length;

  const handleOptionClick = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={clsx("relative flex flex-col pt-7", containerClassName)}>
      <label
        className={clsx(
          "absolute left-0 translate-x-1 -translate-y-6 transform text-sm font-semibold transition-all duration-300",
          !!value && "text-primary",
          labelClassName,
        )}
      >
        {label}
      </label>

      <div className="relative inline-block w-full">
        <div
          className={clsx(
            "text-foreground flex min-h-[50px] w-full justify-between gap-x-3 border-b p-3",
            value ? COLORS.border[color] : "border-foreground",
            className,
          )}
        >
          <div>{selectedOption ? selectedOption.label : placeholder}</div>

          {!noOptions && (
            <Button
              type="button"
              aria-label="Toggle show options"
              onClick={() => setIsOpen((prev) => !prev)}
              disabled={disabled || noOptions}
              unstyled
              className={clsx(
                "transition-colors duration-300",
                COLORS["chevron-button"][color],
                className,
              )}
            >
              <ChevronDown
                className={clsx(
                  "h-6 w-6 cursor-pointer transition-transform duration-300",
                  isOpen && "-rotate-180",
                )}
              />
            </Button>
          )}
        </div>

        <Collapse
          isOpen={isOpen}
          className={clsx(
            "bg-h-background absolute z-10 mt-0 w-full border !border-t-0 shadow-xl",
            COLORS.border[color],
          )}
          contentClassName="max-h-30 overflow-y-scroll"
        >
          {options.map((option, i) => (
            <Button
              type="button"
              key={i}
              onClick={() => handleOptionClick(option.value)}
              unstyled
              className={clsx(
                "flex w-full cursor-pointer justify-between p-3 font-semibold transition-colors duration-300",
                i % 2 === 0 ? "bg-background/50" : "bg-h-background",
                COLORS.option[color],
              )}
            >
              {option.label}
            </Button>
          ))}
        </Collapse>
      </div>
    </div>
  );
};

export default Select;
