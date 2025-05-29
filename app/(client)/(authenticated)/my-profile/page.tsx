"use client";

//  import { useSession } from "next-auth/react";

import PageContainer from "@/components/PageContainer";
import PageUnderConstructionMessage from "@/components/PageUnderConstructionMessage";

const MyProfilePage = () => {
  //  const { data } = useSession();

  return (
    <PageContainer className="border-h-background border-r !px-0">
      <div className="border-h-background flex flex-1 flex-col border-t">
        <div className="flex flex-1 flex-col gap-y-4 p-4">
          <h1 className="text-3xl font-bold">Mi perfil</h1>

          <PageUnderConstructionMessage />
        </div>
      </div>
    </PageContainer>
  );
};

export default MyProfilePage;
