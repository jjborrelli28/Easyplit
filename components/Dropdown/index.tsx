"use client";

import { Fragment, type ReactNode, useEffect, useRef, useState } from "react";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";

import Button, { type ButtonProps } from "../Button";

type DropdownProps = ButtonProps & {
  label: ReactNode;
  items: { label: string; onClick: () => void }[];
  itemVariant?: ButtonProps["variant"];
  itemColor?: ButtonProps["color"];
  itemClassName?: string;
};

const hoveredItemColors = {
  primary: "hover:bg-primary hover:!text-background",
  secondary: "hover:bg-secondary hover:!text-background",
  success: "hover:bg-success hover:!text-background",
  warning: "hover:bg-warning hover:!text-background",
  danger: "hover:bg-danger hover:!text-background",
};

const Dropdown = ({
  label,
  items,
  itemVariant = "text",
  itemColor = "secondary",
  itemClassName,
  ...restProps
}: DropdownProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const variant = restProps.color || "primary";

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <Button onClick={() => setOpen((prev) => !prev)} {...restProps}>
        {label}

        <ChevronDown className="h-4 w-4" />
      </Button>

      {open && (
        <div className="bg-h-background ring-background absolute right-0 z-10 mt-2 w-full min-w-44 origin-top-right shadow-xl ring-1">
          <div className="flex flex-col">
            {items.map((item, i) => (
              <Fragment key={i}>
                <Button
                  onClick={() => {
                    setOpen(false);
                    item.onClick();
                  }}
                  variant={itemVariant}
                  color={itemColor}
                  fullWidth
                  className={clsx(
                    "hover:bg-background justify-start !text-sm !font-medium",
                    hoveredItemColors[variant],
                    itemClassName,
                  )}
                >
                  {item.label}
                </Button>

                {items.length !== ++i && <hr className="text-background" />}
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
