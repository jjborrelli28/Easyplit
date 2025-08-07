"use client";

import { notFound, useParams } from "next/navigation";

import { useSession } from "next-auth/react";

import useGetExpense from "@/hooks/data/expense/useGetExpense";

import type { Expense } from "@/lib/api/types";

import PageContainer from "@/components/PageContainer";
import Spinner from "@/components/Spinner";
import BalanceSection from "./_components/BalanceSection";
import DeleteExpenseSection from "./_components/DeleteExpenseSection";
import HeaderSection from "./_components/HeaderSection";

const ExpensePage = () => {
  const params = useParams();

  const expenseId = params?.id as string;

  if (!expenseId || typeof expenseId !== "string" || expenseId.length <= 1) {
    notFound();
  }

  const { data } = useSession();

  const { data: expense, isPending } = useGetExpense(expenseId);

  const loggedUser = data?.user;
  const isUserEditor =
    loggedUser?.id === expense?.createdById ||
    loggedUser?.id === expense?.paidById;

  return (
    <PageContainer className="border-h-background !px-0 md:border-r">
      <div className="border-h-background flex flex-1 flex-col border-t px-4 py-8 lg:px-8">
        <div className="flex flex-1 flex-col gap-y-8">
          {isPending || !loggedUser ? (
            <div className="flex flex-1 flex-col items-center justify-center">
              <Spinner className="h-12 w-12" />
            </div>
          ) : expense ? (
            <>
              <HeaderSection
                expense={expense as Expense}
                loggedUser={loggedUser}
              />

              <hr className="border-h-background" />

              <BalanceSection
                expense={expense as Expense}
                loggedUser={loggedUser}
              />

              {isUserEditor && (
                <>
                  <hr className="border-h-background" />

                  <DeleteExpenseSection expenseId={expense.id} />
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

export default ExpensePage;
