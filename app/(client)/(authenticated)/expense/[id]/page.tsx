"use client";

import { useState } from "react";

import Image from "next/image";
import { notFound, useParams } from "next/navigation";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarClock,
  CircleChevronDown,
  Info,
  Receipt,
  Scale,
  UserRound,
  UsersRound,
} from "lucide-react";
import clsx from "clsx";

import useGetExpenseById from "@/hooks/data/expense/useGetExpenseById";

import PageContainer from "@/components/PageContainer";
import Spinner from "@/components/Spinner";
import UserCard from "@/components/UserCard";
import Collapse from "@/components/Collapse";
import Button from "@/components/Button";
import { useSession } from "next-auth/react";

const getPersonalBalance = (
  paymentMade: number,
  totalAmount: number,
  totalParticipants: number,
) => {
  const amountPayablePerPerson = totalAmount / totalParticipants;
  const debtBalance = amountPayablePerPerson - paymentMade;

  return debtBalance;
};

const getPositiveTruncatedNumber = (number: number) =>
  Math.floor(Math.abs(number) * 100) / 100;

const ExpensePage = () => {
  const params = useParams();

  const expenseId = params?.id as string;

  if (!expenseId || typeof expenseId !== "string" || expenseId.length <= 1) {
    notFound();
  }

  const { data } = useSession();

  const { data: expense, isPending } = useGetExpenseById(expenseId);

  const [showParticipants, setShowParticipants] = useState(false);

  const loggedUser = data?.user;

  const handleShowParticipants = () =>
    setShowParticipants((prevState) => !prevState);

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
              <section className="grid-rows-auto grid grid-cols-1 items-center justify-center gap-y-4 lg:grid-cols-2 lg:grid-rows-1 lg:gap-x-8">
                <div className="flex items-center gap-x-2">
                  <Receipt className="h-9 w-9" />

                  <h1 className="truncate text-3xl font-bold">
                    {expense.name}
                  </h1>
                </div>

                <div className="flex flex-col gap-x-2 gap-y-1 lg:flex-row lg:items-center lg:justify-end">
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
              </section>

              <hr className="border-h-background" />

              <section className="border-h-background flex flex-col gap-y-4 border p-4">
                <div className="text-info flex items-center gap-x-2">
                  <Info className="h-7 w-8" />

                  <h2 className="text-xl font-semibold">
                    Información del gasto
                  </h2>
                </div>

                <hr className="border-h-background" />

                <div className="flex flex-col gap-y-4">
                  <div className="flex flex-col items-start gap-x-4 gap-y-2 lg:flex-row lg:items-center">
                    <div className="text-info flex items-center gap-x-2">
                      <UserRound className="h-6 w-6" />

                      <p className="text-lg font-medium">Pagado por:</p>
                    </div>

                    <UserCard
                      name={expense.paidBy.name}
                      email={expense.paidBy.email}
                      image={expense.paidBy.image}
                    />
                  </div>

                  <div className="text-foreground/75 flex items-center gap-x-2">
                    <CalendarClock className="h-5 w-5" />

                    <p className="text-sm font-medium">
                      Creado el{" "}
                      {format(
                        new Date(expense.createdAt),
                        "dd 'de' MMMM 'del' yyyy",
                        { locale: es },
                      )}
                    </p>
                  </div>
                </div>

                <hr className="border-h-background" />

                <div className="flex flex-col gap-y-4">
                  <div className="text-info flex items-center gap-x-1.5">
                    <Scale className="h-6 w-6" />

                    <p className="text-lg font-medium">Balance</p>
                  </div>

                  <ul className="flex flex-col gap-y-3">
                    {expense.participants.map(({ id, user, amount }) => {
                      const personalBalance = getPersonalBalance(
                        amount,
                        expense.amount,
                        expense.participants.length,
                      );

                      return (
                        <li key={id} className="flex items-center gap-x-2">
                          {user.image && (
                            <Image
                              alt="User avatar"
                              src={user.image}
                              height={28}
                              width={28}
                              className="rounded-full"
                            />
                          )}

                          <p className="font-medium">
                            {user.name} pago ${amount} y{" "}
                            {personalBalance > 0 ? (
                              <span className="text-d-foreground">
                                debe $
                                {getPositiveTruncatedNumber(personalBalance)}
                              </span>
                            ) : personalBalance === 0 ? (
                              "esta al dia."
                            ) : (
                              <span className="text-s-foreground">
                                {loggedUser.id === expense.paidById
                                  ? "te"
                                  : "le"}{" "}
                                deben $
                                {getPositiveTruncatedNumber(personalBalance)}
                              </span>
                            )}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <hr className="border-h-background" />

                <div className="flex flex-col">
                  <div className="text-info flex items-center gap-x-2">
                    <div className="flex items-center gap-x-1.5">
                      <UsersRound className="h-6 w-6" />

                      <p className="text-lg font-medium">
                        Participantes del gasto{" "}
                        {`(${expense.participants.length})`}
                      </p>
                    </div>

                    <Button
                      aria-label="Toggle show panel list"
                      onClick={handleShowParticipants}
                      unstyled
                      className="hover:text-info/90 h-5 w-5 cursor-pointer align-middle transition-colors duration-300"
                    >
                      <CircleChevronDown
                        className={clsx(
                          "h-5 w-5 transition-transform duration-300",
                          showParticipants && "-rotate-180",
                        )}
                      />
                    </Button>
                  </div>

                  <Collapse isOpen={showParticipants}>
                    <ul
                      className={clsx(
                        "grid-rows-auto grid grid-cols-1 gap-4 transition-[margin] duration-300 lg:grid-cols-2",
                        showParticipants && "mt-4",
                      )}
                    >
                      {expense.participants.map(({ user, id }) => (
                        <li
                          key={id}
                          className="border-foreground/50 flex items-center gap-4 border p-4"
                        >
                          <UserCard
                            id={user.id}
                            name={user.name}
                            email={user.email}
                            image={user.image}
                          />
                        </li>
                      ))}
                    </ul>
                  </Collapse>
                </div>
              </section>
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
