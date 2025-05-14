"use client";

import { redirect, useSearchParams } from "next/navigation";
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

const VerifyEmailResultPage = () => {
  const searchParams = useSearchParams();

  const status = searchParams.get("status");

  if (!status || !["success", "already_verified", "error"].includes(status)) {
    redirect("/login");
  }

  return (
    <PageContainer>
      <div
        className={clsx(
          "flex max-w-2xl border-2 shadow-xl",
          states[status as States].color,
        )}
      >
        <div
          className={clsx(
            "flex items-center border-r-2 p-8",
            states[status as States].color,
          )}
        >
          {states[status as States].icon}
        </div>

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
