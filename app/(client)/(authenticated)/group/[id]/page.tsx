"use client";

import { notFound, useParams } from "next/navigation";

import { useSession } from "next-auth/react";

import useGetGroup from "@/hooks/data/group/useGetGroup";

import PageContainer from "@/components/PageContainer";
import Spinner from "@/components/Spinner";
import BalanceSection from "./_components/BalanceSection";
import DeleteGroupSection from "./_components/DeleteGroupSection";
import ExpenseListSection from "./_components/ExpenseListSection";
import HeaderSection from "./_components/HeaderSection";

const GroupPage = () => {
  const params = useParams();

  const groupId = params?.id as string;

  if (!groupId || typeof groupId !== "string" || groupId.length <= 1) {
    notFound();
  }

  const { data } = useSession();

  const { data: group, isPending } = useGetGroup(groupId);

  const loggedUser = data?.user;
  const isUserEditor = loggedUser?.id === group?.createdById;

  return (
    <PageContainer className="border-h-background !px-0 md:border-r">
      <div className="border-h-background flex flex-1 flex-col border-t px-4 py-8 lg:px-8">
        <div className="flex flex-1 flex-col gap-y-8">
          {isPending || !loggedUser ? (
            <div className="flex flex-1 flex-col items-center justify-center">
              <Spinner className="h-12 w-12" />
            </div>
          ) : group ? (
            <>
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
            </>
          ) : (
            notFound()
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default GroupPage;
