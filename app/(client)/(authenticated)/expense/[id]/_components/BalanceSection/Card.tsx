import type { Dispatch, SetStateAction } from "react";

import Image from "next/image";

import clsx from "clsx";
import {
  BanknoteArrowUp,
  CheckCircle,
  Clock,
  HandCoins,
  UserRoundX,
} from "lucide-react";
import type { Session } from "next-auth";

import type { Expense, ExpenseParticipant, User } from "@/lib/api/types";
import { getPersonalBalance, getPositiveTruncatedNumber } from "@/lib/utils";

import AmountNumber from "@/components/AmountNumber";
import Button from "@/components/Button";
import Tooltip from "@/components/Tooltip";
import type { UpdateExpenseFieldKeys } from "@/components/UpdateExpenseForm";
import { DebtorStatement, PayerStatement } from "./statements";

interface CardProps {
  expenseParticipant: ExpenseParticipant;
  expense: Expense;
  allDebtsSettled: boolean;
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
  allDebtsSettled,
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
  const debtSettled = parsedPersonalBalance === 0;
  const isUserEditor =
    loggedUser?.id === expense?.createdById ||
    loggedUser?.id === expense?.paidById;
  // Rounded to cents, not the raw balance: splitting an amount that doesn't
  // divide evenly (e.g. $5000 / 3) leaves a sub-cent residual between the
  // exact share and the nearest-cent suggested settle amount, which must
  // never read as a real over/underpayment.
  const hasACreditBalance = !isPayer && Math.round(personalBalance * 100) < 0;
  const showSettleButton =
    !hasACreditBalance &&
    !allDebtsSettled &&
    !debtSettled &&
    !isPayer &&
    (isUserEditor || isLoggedUser);
  // Any real payment this participant already made is assumed to be
  // settled between people outside the app — removing them just
  // redistributes the same total among whoever's left, so there's no
  // balance-based restriction here beyond not being the payer and keeping
  // at least 2 participants. Either the creator/payer or the participant
  // themselves (leaving on their own) can do this.
  const showRemoveButton =
    !isPayer &&
    expense.participants.length > 2 &&
    (isUserEditor || isLoggedUser);
  // Three distinct states, not just settled/pending: owing money (amber,
  // this row is why the expense isn't done) is different from being owed
  // money (blue — a payer waiting to collect, or a debtor who overpaid),
  // since the payer already did their part and shouldn't read the same as
  // someone who still has to pay.
  const owesMoney = !isPayer && !debtSettled && !hasACreditBalance;
  const isOwedToThem = isPayer ? !allDebtsSettled : hasACreditBalance;
  const showAmount = owesMoney || isOwedToThem;
  // The payer's own row balance (fairShare - amount paid) is a fixed
  // constant — their `amount` never changes after creation, so it doesn't
  // reflect anyone actually paying them back. What's meaningful to show
  // instead is the sum of what's still outstanding across everyone else,
  // which shrinks as people settle up.
  const totalStillOwedToPayer = isPayer
    ? expense.participants.reduce((total, participant) => {
        if (participant.userId === expense.paidById) return total;

        const balance = getPersonalBalance(
          participant.amount,
          expense.amount,
          expense.participants.length,
        );

        return total + Math.max(0, balance);
      }, 0)
    : 0;
  const displayAmount = isPayer
    ? getPositiveTruncatedNumber(totalStillOwedToPayer)
    : parsedPersonalBalance;

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
            <PayerStatement {...{ isLoggedUser, user, expense }} />
          ) : (
            <DebtorStatement
              {...{
                debtSettled,
                isLoggedUser,
                amount,
                expense,
                loggedUser,
                user,
                hasACreditBalance,
              }}
            />
          )}
        </div>

        <div className="flex w-full flex-col items-end justify-end gap-1.5 lg:w-auto">
          <div
            className={clsx(
              "flex items-center gap-x-1.5 font-semibold",
              owesMoney
                ? "text-warning"
                : isOwedToThem
                  ? "text-info"
                  : "text-success",
            )}
          >
            {showAmount && (
              <span className="text-xs">
                {owesMoney ? "Debe" : isPayer ? "Te deben" : "Le deben"}
              </span>
            )}

            {owesMoney ? (
              <Clock className="h-4 w-4" />
            ) : isOwedToThem ? (
              <HandCoins className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}

            {showAmount ? (
              <AmountNumber size="lg">{displayAmount}</AmountNumber>
            ) : (
              // Matches AmountNumber's "lg" line-height so this row's
              // height doesn't shift depending on whether there's an
              // amount to show.
              <span className="text-lg">Al día</span>
            )}
          </div>

          {(showSettleButton || showRemoveButton) && (
            <div className="flex items-center gap-x-3">
              {showSettleButton && (
                <Tooltip color="info" content="Registrar pago">
                  <Button
                    aria-label="Add payment"
                    onClick={() => {
                      setFieldsToUpdate(["participantPayment"]);
                      setSelectedParticipant(user);
                      setAmountToBeSettled(parsedPersonalBalance);
                      setIsOpen(true);
                    }}
                    unstyled
                    className="text-primary hover:text-primary/90 flex cursor-pointer items-center transition-colors duration-300"
                  >
                    <BanknoteArrowUp className="h-5 w-5" />
                  </Button>
                </Tooltip>
              )}

              {showRemoveButton && (
                <Tooltip color="info" content="Eliminar participante">
                  <Button
                    aria-label="Remove participant"
                    onClick={() => {
                      setFieldsToUpdate(["participantToRemove"]);
                      setSelectedParticipant(user);
                      setIsOpen(true);
                    }}
                    unstyled
                    className="text-danger hover:text-danger/90 flex cursor-pointer items-center transition-colors duration-300"
                  >
                    <UserRoundX className="h-5 w-5" />
                  </Button>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
};
