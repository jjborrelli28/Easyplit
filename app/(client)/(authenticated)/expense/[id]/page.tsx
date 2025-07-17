"use client";

import { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";

import clsx from "clsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  BanknoteArrowUp,
  CalendarArrowUp,
  Group,
  Scale,
  UserRoundX,
} from "lucide-react";
import { useSession } from "next-auth/react";

import useGetExpenseById from "@/hooks/data/expense/useGetExpenseById";

import {
  getPersonalBalance,
  getPositiveTruncatedNumber,
  sortParticipants,
} from "@/lib/utils";

import Button from "@/components/Button";
import {
  EXPENSE_TYPE,
  EXPENSE_TYPES,
} from "@/components/ExpenseTypeSelect/constants";
import PageContainer from "@/components/PageContainer";
import Spinner from "@/components/Spinner";
import DeleteExpenseSection from "./_components/DeleteExpenseSection";

const ExpensePage = () => {
  const params = useParams();

  const expenseId = params?.id as string;

  if (!expenseId || typeof expenseId !== "string" || expenseId.length <= 1) {
    notFound();
  }

  const { data } = useSession();

  const { data: expense, isPending } = useGetExpenseById(expenseId);

  const loggedUser = data?.user;
  const isUserEditor =
    loggedUser?.id === expense?.createdById ||
    loggedUser?.id === expense?.paidById;

  const type = expense?.type ?? EXPENSE_TYPE.UNCATEGORIZED;
  const Icon = EXPENSE_TYPES[type].icon;
  const sortedParticipants = sortParticipants(
    expense?.participants,
    expense?.paidById,
  );

  return (
    <PageContainer className="border-h-background !px-0 md:border-r">
      <div className="border-h-background flex flex-1 flex-col border-t px-4 py-8 lg:px-8">
        <div className="flex flex-1 flex-col gap-y-8">
          {isPending || !loggedUser ? (
            <div className="flex flex-1 flex-col items-center justify-center">
              <Spinner />
            </div>
          ) : expense ? (
            <>
              <section className="grid grid-cols-1 items-center justify-center gap-y-4 2xl:grid-cols-[1fr_434px] 2xl:gap-8">
                <div className="flex items-center gap-x-4">
                  <div
                    className={clsx(
                      "flex h-14 w-14 min-w-14 items-center justify-center rounded-full",
                      EXPENSE_TYPES[type].color,
                    )}
                  >
                    <Icon className="text-background h-8 w-8" />
                  </div>

                  <h1 className="truncate text-3xl font-bold">
                    {expense.name}
                  </h1>
                </div>

                <div className="flex flex-col gap-x-2 gap-y-1 lg:flex-row lg:items-center 2xl:justify-end">
                  <p className="text-foreground/75 text-sm font-semibold">
                    Monto:
                  </p>

                  <div className="text-primary flex max-w-[calc(100%_-_48px)] items-center gap-x-2 overflow-hidden font-semibold">
                    <span className="text-3xl">$</span>

                    <p className="truncate text-5xl">
                      {expense.amount.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-y-2 2xl:col-span-2">
                  <div className="text-foreground/75 flex items-center gap-x-2">
                    <CalendarArrowUp className="h-5 w-5" />

                    <p className="text-sm">
                      Creado por{" "}
                      <span className="font-semibold">
                        {expense.createdBy?.name}
                      </span>{" "}
                      el{" "}
                      <span className="font-semibold">
                        {format(
                          new Date(expense.createdAt),
                          "dd 'de' MMMM 'del' yyyy",
                          { locale: es },
                        )}
                      </span>
                    </p>
                  </div>

                  <div className="text-foreground/75 flex items-center gap-x-2">
                    <BanknoteArrowUp className="h-5 w-5" />

                    <p className="text-sm">
                      Pagado por{" "}
                      <span className="font-semibold">
                        {expense.paidBy?.name}
                      </span>{" "}
                      el{" "}
                      <span className="font-semibold">
                        {format(
                          new Date(expense.paymentDate),
                          "dd 'de' MMMM 'del' yyyy",
                          { locale: es },
                        )}
                      </span>
                    </p>
                  </div>

                  <div className="text-foreground/75 flex items-center gap-x-2">
                    <Group className="h-5 w-5" />

                    {expense.groupId ? (
                      <p className="text-sm">
                        Este gasto pertenece al grupo{" "}
                        <Link
                          href={`/group/${expense.groupId}`}
                          className="hover:text-primary cursor-pointer font-semibold transition-colors duration-300"
                        >
                          {expense.group?.name}
                        </Link>
                      </p>
                    ) : (
                      <Button
                        aria-label="Add expense to group"
                        unstyled
                        className="hover:text-primary cursor-pointer text-sm transition-colors duration-300"
                      >
                        ¿Deseas añadir este gasto a un grupo existente?
                      </Button>
                    )}
                  </div>
                </div>
              </section>

              <hr className="border-h-background" />

              <section className="flex flex-col gap-y-8">
                <div className="flex items-center gap-x-1.5">
                  <Scale className="h-8 w-8" />

                  <h2 className="text-xl font-semibold">Balance</h2>
                </div>

                <ul className="border-h-background flex flex-col border shadow-xl">
                  {sortedParticipants.map(({ id, user, amount }, i) => {
                    const personalBalance = getPersonalBalance(
                      amount,
                      expense.amount,
                      expense.participants.length,
                    );
                    const parsedPersonalBalance =
                      getPositiveTruncatedNumber(personalBalance);

                    const isPayer = user.id === expense.paidById;
                    const isLoggedUser = user.id === loggedUser.id;

                    const payerStatement = isLoggedUser ? (
                      <>
                        Pagaste <Amount>{amount}</Amount> y te deben{" "}
                        <Amount className="text-s-foreground">
                          {parsedPersonalBalance}
                        </Amount>
                      </>
                    ) : (
                      <>
                        {user.name} pagó <Amount>{amount}</Amount> y le deben{" "}
                        <Amount className="text-d-foreground">
                          {parsedPersonalBalance}
                        </Amount>
                      </>
                    );
                    const debtorStatement = isLoggedUser ? (
                      loggedUser.id === expense.paidById ? (
                        <>
                          {user.name} te debe{" "}
                          <Amount className="text-s-foreground">
                            {parsedPersonalBalance}
                          </Amount>
                        </>
                      ) : (
                        <>
                          Debes{" "}
                          <Amount className="text-d-foreground">
                            {parsedPersonalBalance}
                          </Amount>{" "}
                          a {expense.paidBy.name}
                        </>
                      )
                    ) : loggedUser.id === expense.paidById ? (
                      <>
                        {user.name} te debe{" "}
                        <Amount className="text-s-foreground">
                          {parsedPersonalBalance}
                        </Amount>
                      </>
                    ) : (
                      <>
                        {user.name} debe{" "}
                        <Amount className="text-d-foreground">
                          {parsedPersonalBalance}
                        </Amount>{" "}
                        a {expense.paidBy.name}
                      </>
                    );

                    return (
                      <li
                        key={id}
                        className={clsx(
                          "flex flex-col items-start justify-between gap-4 p-4 lg:flex-row lg:items-center",
                          i % 2 ? "bg-background" : "bg-h-background",
                        )}
                      >
                        <div className="flex w-full items-center gap-x-4">
                          {user.image && (
                            <Image
                              alt="User avatar"
                              src={user.image}
                              height={48}
                              width={48}
                              className="rounded-full"
                            />
                          )}

                          <p>{isPayer ? payerStatement : debtorStatement}</p>
                        </div>

                        {isUserEditor && user.id !== expense.paidById && (
                          <div className="flex w-full flex-col items-end justify-end gap-1 lg:w-auto">
                            <Button
                              aria-label="Remove user"
                              onClick={() => undefined}
                              unstyled
                              className="text-primary hover:text-primary/90 flex w-fit cursor-pointer items-center gap-x-2 text-sm font-semibold text-nowrap transition-colors duration-300"
                            >
                              <BanknoteArrowUp className="h-5 w-5" /> Liquidar
                              deuda
                            </Button>

                            <Button
                              aria-label="Add payment"
                              onClick={() => undefined}
                              unstyled
                              className="text-danger hover:text-danger/90 flex w-fit cursor-pointer items-center gap-x-2 text-sm font-semibold text-nowrap transition-colors duration-300"
                            >
                              <UserRoundX className="h-5 w-5" /> Eliminar
                              participante
                            </Button>
                          </div>
                        )}

                        {user.id === loggedUser.id && (
                          <div className="flex w-full flex-col items-end justify-end gap-1 lg:w-auto">
                            <Button
                              aria-label="Remove participant"
                              onClick={() => undefined}
                              unstyled
                              className="text-primary hover:text-primary/90 flex w-fit cursor-pointer items-center gap-x-2 text-sm font-semibold text-nowrap transition-colors duration-300"
                            >
                              <BanknoteArrowUp className="h-5 w-5" /> Liquidar
                              deuda
                            </Button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <div className="flex justify-end">
                  <Button color="secondary" variant="outlined">
                    Añadir participante
                  </Button>
                </div>
              </section>

              {isUserEditor && <DeleteExpenseSection expenseId={expense.id} />}
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

const Amount = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span className={clsx("font-semibold text-nowrap", className)}>
    <span className="relative top-[-1.75px] mr-0.25 inline-block text-[11px]">
      $
    </span>
    {children}
  </span>
);
