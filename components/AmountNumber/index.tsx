import clsx from "clsx";

import { formatAmount } from "@/lib/utils";

const SIZES = {
  xs: { container: "text-xs", currency: "top-[-1.5px] mr-0.25 text-[8px]" },
  sm: { container: "text-sm", currency: "top-[-1.5px] mr-0.25 text-[9.5px]" },
  md: { container: "text-md", currency: "top-[-1.75px] mr-0.25 text-[11px]" },
  lg: { container: "text-lg", currency: "top-[-2px] mr-0.5 text-[12.5px]" },
};

interface AmountNumberProps {
  children: number;
  size?: "xs" | "sm" | "md" | "lg";
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

    {formatAmount(children)}
  </span>
);

export default AmountNumber;
