import type { ReactNode } from "react";

import clsx from "clsx";

interface CollapseProps {
  children: ReactNode;
  isOpen: boolean;
  className?: string;
  containerClassName?: string;
}

const Collapse = ({
  children,
  isOpen,
  className,
  containerClassName,
}: CollapseProps) => {
  return (
    <div
      className={clsx(
        "grid-rows-auto grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-300",
        className,
        isOpen && "grid-rows-[1fr] opacity-100",
      )}
    >
      <div className={clsx("overflow-hidden", containerClassName)}>
        {children}
      </div>
    </div>
  );
};

export default Collapse;
