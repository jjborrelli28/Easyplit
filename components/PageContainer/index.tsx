import type { HTMLAttributes } from "react";

import clsx from "clsx";

type PageContainerProps = HTMLAttributes<HTMLElement>;

const PageContainer = ({
  children,
  className,
  ...restProps
}: PageContainerProps) => {
  return (
    <main
      className={clsx(
        "py-header container mx-auto flex min-h-screen flex-col items-center justify-center px-4",
        className,
      )}
      {...restProps}
    >
      {children}
    </main>
  );
};

export default PageContainer;
