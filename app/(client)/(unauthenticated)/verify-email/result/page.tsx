import { notFound } from "next/navigation";
import type { ReactElement } from "react";

import clsx from "clsx";
import { CheckCircle, CircleAlert, CircleX } from "lucide-react";

import PageContainer from "@/components/PageContainer";
import {
  AlreadyVerified,
  ErrorMessage,
  SuccessMessage,
} from "./_components/Messages";

type States = "success" | "already_verified" | "error";

const states: Record<States, { color: string; icon: ReactElement }> = {
  success: {
    color: "border-success",
    icon: <CheckCircle className="text-success h-14 w-14" />,
  },
  ["already_verified"]: {
    color: "border-warning",
    icon: <CircleAlert className="text-warning h-14 w-14" />,
  },
  error: {
    color: "border-danger",
    icon: <CircleX className="text-danger h-14 w-14" />,
  },
};

interface VerifyEmailResultPageProps {
  searchParams: Promise<{ status?: States }>;
}

const VerifyEmailResultPage = async ({
  searchParams,
}: VerifyEmailResultPageProps) => {
  const { status } = await searchParams;

  if (!status || !["success", "already_verified", "error"].includes(status)) {
    notFound();
  }

  return (
    <PageContainer centered>
      <div
        className={clsx(
          "flex w-full max-w-md flex-col items-center space-y-8 border-1 p-8 text-center shadow-xl",
          states[status].color,
        )}
      >
        {states[status].icon}

        {status === "success" ? (
          <SuccessMessage />
        ) : status === "already_verified" ? (
          <AlreadyVerified />
        ) : (
          <ErrorMessage />
        )}
      </div>
    </PageContainer>
  );
};

export default VerifyEmailResultPage;
