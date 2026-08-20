"use client";

import { useParams } from "next/navigation";

import { useSession } from "next-auth/react";

import useGetGroup from "@/hooks/data/group/useGetGroup";

import NotFoundMessage from "@/components/NotFoundMessage";
import PageContainer from "@/components/PageContainer";
import Spinner from "@/components/Spinner";
import BalanceSection from "./_components/BalanceSection";
import DeleteGroupSection from "./_components/DeleteGroupSection";
import ExpenseListSection from "./_components/ExpenseListSection";
import HeaderSection from "./_components/HeaderSection";

const GroupPage = () => {
  const params = useParams();

  const groupId = params?.id as string;
  const isValidGroupId =
    !!groupId && typeof groupId === "string" && groupId.length > 1;

  const { data } = useSession();

  const {
    data: group,
    isPending,
    isError,
  } = useGetGroup(isValidGroupId ? groupId : null);

  const loggedUser = data?.user;

  if (!isValidGroupId) {
    return <NotFoundMessage />;
  }

  if (isPending || !loggedUser) {
    return (
      <PageContainer className="border-h-background !px-0 md:border-r">
        <div className="border-h-background flex flex-1 flex-col border-t px-4 py-8 lg:px-8">
          <div className="flex flex-1 flex-col items-center justify-center">
            <Spinner className="h-12 w-12" />
          </div>
        </div>
      </PageContainer>
    );
  }

  // A 403 (not a group member) is indistinguishable from a fetch failure
  // here on purpose — either way the user gets the same 404, never the raw
  // error or the underlying data.
  if (isError || !group) {
    return <NotFoundMessage />;
  }

  const isUserEditor = loggedUser.id === group.createdById;

  return (
    <PageContainer className="border-h-background !px-0 md:border-r">
      <div className="border-h-background flex flex-1 flex-col border-t px-4 py-8 lg:px-8">
        <div className="flex flex-1 flex-col gap-y-8">
          <HeaderSection group={group} loggedUser={loggedUser} />

          <BalanceSection group={group} loggedUser={loggedUser} />

          <hr className="border-h-background" />

          <ExpenseListSection group={group} loggedUser={loggedUser} />

          {isUserEditor && (
            <>
              <hr className="border-h-background" />

              <DeleteGroupSection groupId={group.id} />
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default GroupPage;
