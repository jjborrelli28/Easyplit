"use client";

import type { ComponentProps } from "react";

import * as RadixPopover from "@radix-ui/react-popover";
import clsx from "clsx";

const Popover = RadixPopover.Root;
const PopoverTrigger = RadixPopover.Trigger;

type PopoverContentProps = ComponentProps<typeof RadixPopover.Content> & {
  className?: string;
};

const PopoverContent = ({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: PopoverContentProps) => {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        align={align}
        sideOffset={sideOffset}
        className={clsx(
          "border-primary bg-h-background text-foreground z-50 w-md border p-4 shadow-xl outline-none",
          className,
        )}
        {...props}
      />
    </RadixPopover.Portal>
  );
};

PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverContent, PopoverTrigger };
