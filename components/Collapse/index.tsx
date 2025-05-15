import { type ReactNode } from "react";

import clsx from "clsx";

const Collapse = ({
  show,
  children,
}: {
  show: boolean;
  children: ReactNode;
}) => {
  return (
    <div
      className={clsx(
        "grid-rows-auto grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity]",
        show && "grid-rows-[1fr] opacity-100",
      )}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
};

export default Collapse;
