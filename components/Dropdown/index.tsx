"use client";

import { Fragment, type ReactNode, useEffect, useRef, useState } from "react";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";

import Button, { type ButtonProps } from "../Button";
import Collapse from "../Collapse";

const COLORS = {
  item: {
    primary: "hover:bg-primary hover:!text-background",
    secondary: "hover:bg-secondary hover:!text-background",
    info: "hover:bg-info hover:!text-background",
    success: "hover:bg-success hover:!text-background",
    warning: "hover:bg-warning hover:!text-background",
    danger: "hover:bg-danger hover:!text-background",
  },
};

type DropdownProps = ButtonProps & {
  label: ReactNode;
  items: { label: string; onClick: () => void }[];
  containerClassName?: string;
  itemVariant?: ButtonProps["variant"];
  itemColor?: ButtonProps["color"];
  itemClassName?: string;
};

const Dropdown = ({
  label,
  items,
  containerClassName,
  itemVariant = "text",
  itemColor = "secondary",
  itemClassName,
  ...restProps
}: DropdownProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const variant = restProps.color || "primary";

  return (
    <div
      ref={ref}
      className={clsx("relative inline-block text-left", containerClassName)}
    >
      <Button
        onClick={() => setIsOpen((prevState) => !prevState)}
        {...restProps}
      >
        {label}

        <ChevronDown
          className={clsx(
            "h-4 w-4 transition-transform duration-300",
            isOpen && "-rotate-180",
          )}
        />
      </Button>

      <Collapse
        isOpen={isOpen}
        className="bg-h-background ring-foreground/50 absolute right-0 z-30 mt-2 w-full min-w-44 origin-top-right shadow-xl ring-1"
      >
        <div className="flex flex-col">
          {items.map((item, i) => (
            <Fragment key={i}>
              <Button
                onClick={() => {
                  setIsOpen(false);
                  item.onClick();
                }}
                variant={itemVariant}
                color={itemColor}
                fullWidth
                className={clsx(
                  "hover:bg-background justify-start !text-sm !font-medium",
                  COLORS.item[variant],
                  itemClassName,
                )}
              >
                {item.label}
              </Button>

              {items.length !== ++i && <hr className="text-foreground/50" />}
            </Fragment>
          ))}
        </div>
      </Collapse>
    </div>
  );
};

export default Dropdown;
