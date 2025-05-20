import { Suspense } from "react";

import LoadingPage from "./_components/LoadingPage";
import ResetPasswordPageContent from "./_components/ResetPasswordPageContent";

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={<LoadingPage />}>
      <ResetPasswordPageContent />
    </Suspense>
  );
};

export default ResetPasswordPage;
