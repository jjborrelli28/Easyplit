import { Suspense } from "react";

import PageContainer from "@/components/PageContainer";
import Spinner from "@/components/Spinner";
import ResetPasswordPage from "./_components/ResetPasswordPage";

const ResetPasswordRoot = () => {
  return (
    <Suspense
      fallback={
        <PageContainer centered>
          <Spinner className="h-12 w-12" />
        </PageContainer>
      }
    >
      <ResetPasswordPage />
    </Suspense>
  );
};

export default ResetPasswordRoot;
