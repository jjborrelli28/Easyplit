"use client";

import { useSession } from "next-auth/react";

import useGetMyExpensesAndGroups from "@/hooks/data/user/useGetMyExpensesAndGroups";

import PageContainer from "@/components/PageContainer";
import Spinner from "@/components/Spinner";
import ExpenseListSection from "./_components/ExpenseListSection";
import StatsSection from "./_components/StatsSection";

const AllExpensesPage = () => {
  const { data } = useSession();
  const { data: expensesAndGroups, isPending } = useGetMyExpensesAndGroups();

  const loggedUser = data?.user;
  const expenses = expensesAndGroups?.expenses ?? [];

  return (
    <PageContainer className="border-h-background !px-0 md:border-r">
      <div className="border-h-background flex flex-1 flex-col border-t px-4 py-8 lg:px-8">
        <div className="flex flex-1 flex-col gap-y-8">
          <h1 className="text-3xl font-bold">Todos los gastos</h1>

          <hr className="border-h-background" />

          {isPending || !loggedUser ? (
            <div className="flex flex-1 flex-col items-center justify-center">
              <Spinner className="h-12 w-12" />
            </div>
          ) : (
            <>
              <StatsSection expenses={expenses} loggedUser={loggedUser} />

              <hr className="border-h-background" />

              <ExpenseListSection expenses={expenses} loggedUser={loggedUser} />
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default AllExpensesPage;
