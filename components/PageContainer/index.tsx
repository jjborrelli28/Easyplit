import type { HTMLAttributes } from "react";

import clsx from "clsx";

interface PageContainerProps extends HTMLAttributes<HTMLElement> {
  centered?: boolean;
}

const PageContainer = ({
  children,
  centered,
  className,
  ...restProps
}: PageContainerProps) => {
  return (
    <main
      className={clsx(
        "pt-header container mx-auto flex min-h-screen flex-col px-4 pb-4",
        centered && "items-center justify-center",
        className,
      )}
      {...restProps}
    >
      {children}
    </main>
  );
};

export default PageContainer;
