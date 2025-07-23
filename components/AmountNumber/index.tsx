import type { ReactNode } from "react";

import clsx from "clsx";

const SIZES = {
  md: { container: "text-md", currency: "top-[-1.75px] mr-0.25 text-[11px]" },
  lg: { container: "text-lg", currency: "top-[-2px] mr-0.5 text-[12.5px]" },
};

interface AmountNumberProps {
  children: ReactNode;
  size?: "md" | "lg";
  className?: string;
}
const AmountNumber = ({
  children,
  size = "md",
  className,
}: AmountNumberProps) => (
  <span
    className={clsx(
      "font-semibold text-nowrap",
      SIZES[size].container,
      className,
    )}
  >
    <span className={clsx("relative inline-block", SIZES[size].currency)}>
      $
    </span>

    {children}
  </span>
);

export default AmountNumber;
