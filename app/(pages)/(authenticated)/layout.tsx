import type { ReactNode } from "react";

import Header from "./_components/Header";

const AuthenticatedLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <>
      <Header />
      {children}
    </>
  );
};

export default AuthenticatedLayout;
