import type { ReactNode } from "react";

import SidePanel from "@/components/SidePanel";

interface AuthenticatedPageLayoutProps {
  children: ReactNode;
}

const AuthenticatedPageLayout = async ({
  children,
}: AuthenticatedPageLayoutProps) => {
  return (
    <div className="container mx-auto flex">
      <SidePanel />

      {children}
    </div>
  );
};

export default AuthenticatedPageLayout;
