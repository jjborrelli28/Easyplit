"use client";

import { useParams } from "next/navigation";

import { useSession } from "next-auth/react";

import useGetExpense from "@/hooks/data/expense/useGetExpense";

import NotFoundMessage from "@/components/NotFoundMessage";
import PageContainer from "@/components/PageContainer";
import Spinner from "@/components/Spinner";
import BalanceSection from "./_components/BalanceSection";
import DeleteExpenseSection from "./_components/DeleteExpenseSection";
import HeaderSection from "./_components/HeaderSection";
import PaymentHistorySection from "./_components/PaymentHistorySection";

const ExpensePage = () => {
  const params = useParams();

  const expenseId = params?.id as string;
  const isValidExpenseId =
    !!expenseId && typeof expenseId === "string" && expenseId.length > 1;

  const { data } = useSession();

  const {
    data: expense,
    isPending,
    isError,
  } = useGetExpense(isValidExpenseId ? expenseId : null);

  const loggedUser = data?.user;

  if (!isValidExpenseId) {
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

  // A 403 (not a participant/group member) is indistinguishable from a
  // fetch failure here on purpose — either way the user gets the same 404,
  // never the raw error or the underlying data.
  if (isError || !expense) {
    return <NotFoundMessage />;
  }

  const isUserEditor =
    loggedUser.id === expense.createdById ||
    loggedUser.id === expense.paidById;

  return (
    <PageContainer className="border-h-background !px-0 md:border-r">
      <div className="border-h-background flex flex-1 flex-col border-t px-4 py-8 lg:px-8">
        <div className="flex flex-1 flex-col gap-y-8">
          <HeaderSection expense={expense} loggedUser={loggedUser} />

          <hr className="border-h-background" />

          <BalanceSection expense={expense} loggedUser={loggedUser} />

          <PaymentHistorySection expense={expense} />

          {isUserEditor && (
            <>
              <hr className="border-h-background" />

              <DeleteExpenseSection expenseId={expense.id} />
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default ExpensePage;
