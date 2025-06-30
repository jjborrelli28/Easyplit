import { useSession } from "next-auth/react";

import useGetLinkedExpenses from "@/hooks/expenses/useGetLinkedExpenses";

import clsx from "clsx";

import Card, { CARD_TYPE } from "../Card";
import Spinner from "../Spinner";

interface ExpenseList {
  className?: string;
}

const ExpenseList = ({ className }: ExpenseList) => {
  const { status, data } = useSession();

  const user = data?.user;

  const { data: expenses } = useGetLinkedExpenses(user?.id);

  return (
    <div className={clsx("border-box flex flex-1 flex-col gap-y-4", className)}>
      {status === "loading" ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : status === "authenticated" ? (
        <>
          {!!expenses?.length ? (
            expenses.map((expense, i) => (
              <Card
                key={i}
                type={CARD_TYPE.EXPENSE}
                data={expense}
                loggedInUser={user}
              />
            ))
          ) : (
            <p className="text-foreground/75">
              No hay gastos registrados. Creá un gasto para empezar a organizar
              tus finanzas.
            </p>
          )}
        </>
      ) : null}
    </div>
  );
};

export default ExpenseList;
