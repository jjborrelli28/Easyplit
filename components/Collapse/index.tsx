import { type ReactNode } from "react";

import clsx from "clsx";

interface CollapseProps {
  open: boolean;
  children: ReactNode;
}

const Collapse = ({ open, children }: CollapseProps) => {
  return (
    <div
      className={clsx(
        "grid-rows-auto grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-300",
        open && "grid-rows-[1fr] opacity-100",
      )}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
};

export default Collapse;
