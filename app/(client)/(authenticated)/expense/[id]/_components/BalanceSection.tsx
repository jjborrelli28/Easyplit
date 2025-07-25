import { useState } from "react";

import Image from "next/image";

import type { Session } from "next-auth";

import clsx from "clsx";
import { BanknoteArrowUp, Scale, UserRoundX } from "lucide-react";

import type { Expense, User } from "@/lib/api/types";
import {
  getPersonalBalance,
  getPositiveTruncatedNumber,
  sortParticipants,
} from "@/lib/utils";

import AmountNumber from "@/components/AmountNumber";
import Button from "@/components/Button";
import UpdateExpenseForm, {
  type UpdateExpenseFieldKeys,
} from "@/components/UpdateExpenseForm";

interface BalanceSectionProps {
  expense: Expense;
  loggedUser: Session["user"];
}

const BalanceSection = ({ expense, loggedUser }: BalanceSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fieldsToUpdate, setFieldsToUpdate] = useState<UpdateExpenseFieldKeys>(
    [],
  );
  const [selectedParticipant, setSelectedParticipant] = useState<User | null>(
    null,
  );

  const isUserEditor =
    loggedUser?.id === expense?.createdById ||
    loggedUser?.id === expense?.paidById;
  const sortedParticipants = sortParticipants(
    expense?.participants,
    expense?.paidById,
  );

  return (
    <>
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
                Pagaste <AmountNumber>{amount}</AmountNumber> y te deben{" "}
                <AmountNumber className="text-s-foreground">
                  {parsedPersonalBalance}
                </AmountNumber>
              </>
            ) : (
              <>
                {user.name} pagó <AmountNumber>{amount}</AmountNumber> y le
                deben{" "}
                <AmountNumber className="text-d-foreground">
                  {parsedPersonalBalance}
                </AmountNumber>
              </>
            );
            const debtorStatement = isLoggedUser ? (
              loggedUser.id === expense.paidById ? (
                <>
                  {user.name} te debe{" "}
                  <AmountNumber className="text-s-foreground">
                    {parsedPersonalBalance}
                  </AmountNumber>
                </>
              ) : (
                <>
                  Debes{" "}
                  <AmountNumber className="text-d-foreground">
                    {parsedPersonalBalance}
                  </AmountNumber>{" "}
                  a {expense.paidBy.name}
                </>
              )
            ) : loggedUser.id === expense.paidById ? (
              <>
                {user.name} te debe{" "}
                <AmountNumber className="text-s-foreground">
                  {parsedPersonalBalance}
                </AmountNumber>
              </>
            ) : (
              <>
                {user.name} debe{" "}
                <AmountNumber className="text-d-foreground">
                  {parsedPersonalBalance}
                </AmountNumber>{" "}
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

                <div className="flex w-full flex-col items-end justify-end gap-1 lg:w-auto">
                  {user.id !== expense.paidById &&
                    (isUserEditor || user.id === loggedUser.id) && (
                      <Button
                        aria-label="Add payment"
                        onClick={() => undefined}
                        unstyled
                        className="text-primary hover:text-primary/90 flex w-fit cursor-pointer items-center gap-x-2 text-sm font-semibold text-nowrap transition-colors duration-300"
                      >
                        <BanknoteArrowUp className="h-5 w-5" /> Liquidar deuda
                      </Button>
                    )}

                  {isUserEditor && user.id !== expense.paidById && (
                    <Button
                      aria-label="Remove participant"
                      onClick={() => {
                        setFieldsToUpdate(["participantToRemove"]);
                        setSelectedParticipant(user);
                        setIsOpen(true);
                      }}
                      unstyled
                      className="text-danger hover:text-danger/90 flex w-fit cursor-pointer items-center gap-x-2 text-sm font-semibold text-nowrap transition-colors duration-300"
                    >
                      <UserRoundX className="h-5 w-5" /> Eliminar participante
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex justify-end">
          <Button
            aria-label="Add participant"
            onClick={() => {
              setFieldsToUpdate(["participantsToAdd"]);

              setIsOpen(true);
            }}
            color="secondary"
            variant="outlined"
          >
            Añadir participante/s
          </Button>
        </div>
      </section>

      {expense && loggedUser && (
        <UpdateExpenseForm
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          expense={expense}
          user={loggedUser}
          fieldsToUpdate={fieldsToUpdate}
          selectedParticipant={selectedParticipant}
        />
      )}
    </>
  );
};

export default BalanceSection;
