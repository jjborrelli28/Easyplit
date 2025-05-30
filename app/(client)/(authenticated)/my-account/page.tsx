"use client";

//  import { useSession } from "next-auth/react";

import PageContainer from "@/components/PageContainer";
import PageUnderConstructionMessage from "@/components/PageUnderConstructionMessage";

const MyAccountPage = () => {
  //  const { data } = useSession();

  return (
    <PageContainer className="border-h-background !px-0 md:border-r">
      <div className="border-h-background flex flex-1 flex-col border-t p-4">
        <h1 className="text-3xl font-bold">Mi cuenta</h1>

        <PageUnderConstructionMessage />
      </div>
    </PageContainer>
  );
};

export default MyAccountPage;
