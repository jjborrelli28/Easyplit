import type { Dispatch, SetStateAction } from "react";

import Image from "next/image";

import clsx from "clsx";
import { BanknoteArrowUp, UserRoundX } from "lucide-react";
import type { Session } from "next-auth";

import type { Expense, ExpenseParticipant, User } from "@/lib/api/types";
import {
  areAllDebtsSettled,
  getPersonalBalance,
  getPositiveTruncatedNumber,
} from "@/lib/utils";

import Button from "@/components/Button";
import type { UpdateExpenseFieldKeys } from "@/components/UpdateExpenseForm";
import { DebtorStatement, PayerStatement } from "./statements";

interface CardProps {
  expenseParticipant: ExpenseParticipant;
  expense: Expense;
  loggedUser: Session["user"];
  setFieldsToUpdate: Dispatch<SetStateAction<UpdateExpenseFieldKeys>>;
  setSelectedParticipant: Dispatch<SetStateAction<User | null>>;
  setAmountToBeSettled: Dispatch<SetStateAction<number | null>>;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  containerClassName?: string;
}

export const Card = ({
  expenseParticipant,
  expense,
  loggedUser,
  setFieldsToUpdate,
  setSelectedParticipant,
  setAmountToBeSettled,
  setIsOpen,
  containerClassName,
}: CardProps) => {
  const { id, user, amount } = expenseParticipant;

  const personalBalance = getPersonalBalance(
    amount,
    expense.amount,
    expense.participants.length,
  );
  const parsedPersonalBalance = getPositiveTruncatedNumber(personalBalance);
  const isPayer = user.id === expense.paidById;
  const isLoggedUser = user.id === loggedUser.id;
  const allDebtsSettled = areAllDebtsSettled(expense);
  const debtSettled = parsedPersonalBalance === 0;
  const isUserEditor =
    loggedUser?.id === expense?.createdById ||
    loggedUser?.id === expense?.paidById;
  const hasACreditBalance = !isPayer && personalBalance < 0;
  const showSettleButton =
    !hasACreditBalance &&
    !allDebtsSettled &&
    !debtSettled &&
    user.id !== expense.paidById &&
    (isUserEditor || user.id === loggedUser.id);
  const showRemoveButton =
    !debtSettled &&
    !allDebtsSettled &&
    isUserEditor &&
    user.id !== expense.paidById &&
    expense.participants.length > 2;

  return (
    <li
      key={id}
      className={clsx(
        "flex items-center justify-between gap-4 p-4",
        containerClassName,
      )}
    >
      {user.image && (
        <Image
          alt="User avatar"
          src={user.image}
          height={48}
          width={48}
          className="rounded-full"
        />
      )}

      <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-y-1">
          {isPayer ? (
            <PayerStatement
              {...{
                allDebtsSettled,
                isLoggedUser,
                user,
                parsedPersonalBalance,
              }}
            />
          ) : (
            <DebtorStatement
              {...{
                debtSettled,
                isLoggedUser,
                amount,
                expense,
                loggedUser,
                user,
                parsedPersonalBalance,
                hasACreditBalance,
              }}
            />
          )}
        </div>

        {(showSettleButton || showRemoveButton) && (
          <div className="flex w-full flex-col items-end justify-end gap-1 lg:w-auto">
            {showSettleButton && (
              <Button
                aria-label="Add payment"
                onClick={() => {
                  setFieldsToUpdate(["participantPayment"]);
                  setSelectedParticipant(user);
                  setAmountToBeSettled(parsedPersonalBalance);
                  setIsOpen(true);
                }}
                unstyled
                className="text-primary hover:text-primary/90 flex w-fit cursor-pointer items-center gap-x-2 text-sm font-semibold text-nowrap transition-colors duration-300"
              >
                <BanknoteArrowUp className="h-5 w-5" /> Liquidar deuda
              </Button>
            )}

            {showRemoveButton && (
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
        )}
      </div>
    </li>
  );
};
