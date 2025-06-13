"use client";

import { notFound } from "next/navigation";

import { useSession } from "next-auth/react";

import PageContainer from "@/components/PageContainer";
import Spinner from "@/components/Spinner";
import DeleteAccountSection from "./_components/DeleteAccountSection";
import MyAccountSection from "./_components/MyAccountSection";

const MyAccountPage = () => {
  const { status, data } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const user = data?.user;

  return (
    <PageContainer className="border-h-background !px-0 md:border-r">
      <div className="border-h-background flex flex-1 flex-col gap-y-8 border-t px-4 py-8 lg:px-8">
        {isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <Spinner className="h-12 w-12" />
          </div>
        ) : isAuthenticated && user ? (
          <>
            <MyAccountSection user={user} />

            <hr className="border-h-background w-full" />

            <DeleteAccountSection user={user} />
          </>
        ) : (
          notFound()
        )}
      </div>
    </PageContainer>
  );
};

export default MyAccountPage;
