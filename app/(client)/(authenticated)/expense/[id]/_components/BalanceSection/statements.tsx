import { CheckCircle } from "lucide-react";
import type { Session } from "next-auth";

import type { Expense, User } from "@/lib/api/types";
import { formatAmount } from "@/lib/utils";

import AmountNumber from "@/components/AmountNumber";

export const PayerStatement = ({
  allDebtsSettled,
  isLoggedUser,
  user,
  parsedPersonalBalance,
}: {
  allDebtsSettled: boolean;
  isLoggedUser: boolean;
  user: User;
  parsedPersonalBalance: number;
}) =>
  allDebtsSettled ? (
    isLoggedUser ? (
      <>
        <p className="text-primary font-semibold">Cubriste el gasto completo</p>

        <p className="text-success text-xs font-semibold">
          No te deben nada <CheckCircle className="mb-0.5 inline h-3 w-3" />
        </p>
      </>
    ) : (
      <>
        <p className="text-primary font-semibold">
          {user.name} cubrió el gasto completo
        </p>

        <p className="text-success text-xs font-semibold">
          No le deben nada <CheckCircle className="mb-0.5 inline h-3 w-3" />
        </p>
      </>
    )
  ) : isLoggedUser ? (
    <>
      <p className="text-primary font-semibold">Cubriste el gasto completo</p>

      <p className="text-d-foreground text-xs font-semibold">
        Aún te deben{" "}
        <AmountNumber size="xs">
          {formatAmount(parsedPersonalBalance)}
        </AmountNumber>
      </p>
    </>
  ) : (
    <>
      <p className="text-primary font-semibold">
        {user.name} cubrió el gasto completo
      </p>

      <p className="text-d-foreground text-xs font-semibold">
        Aún le deben{" "}
        <AmountNumber size="xs">
          {formatAmount(parsedPersonalBalance)}
        </AmountNumber>
      </p>
    </>
  );

export const DebtorStatement = ({
  debtSettled,
  isLoggedUser,
  amount,
  expense,
  loggedUser,
  user,
  parsedPersonalBalance,
  hasACreditBalance,
}: {
  debtSettled: boolean;
  isLoggedUser: boolean;
  amount: number;
  expense: Expense;
  loggedUser: Session["user"];
  user: User;
  parsedPersonalBalance: number;
  hasACreditBalance: boolean;
}) =>
  hasACreditBalance ? (
    isLoggedUser ? (
      <>
        <p className="text-s-foreground">
          Pagaste <AmountNumber>{formatAmount(amount)}</AmountNumber> a{" "}
          {expense.paidBy.name}
        </p>

        <p className="text-xs">
          <span className="text-success">
            Estás al día <CheckCircle className="mb-0.5 inline h-3 w-3" />
          </span>
          , pero pagaste de más.{" "}
          <span className="text-d-foreground font-semibold">
            {expense.paidBy.name} te debe{" "}
            <AmountNumber size="xs">
              {formatAmount(parsedPersonalBalance)}
            </AmountNumber>
          </span>
        </p>
      </>
    ) : loggedUser.id === expense.paidById ? (
      <>
        <p className="text-s-foreground">
          {user.name} te pagó{" "}
          <AmountNumber>{formatAmount(amount)}</AmountNumber>
        </p>

        <p className="text-success text-xs">
          <span className="text-success">
            Está al día <CheckCircle className="mb-0.5 inline h-3 w-3" />
          </span>
          , pero pagó de más.{" "}
          <span className="text-d-foreground font-semibold">
            Le debés{" "}
            <AmountNumber size="xs">
              {formatAmount(parsedPersonalBalance)}
            </AmountNumber>
          </span>
        </p>
      </>
    ) : (
      <>
        <p className="text-s-foreground">
          {user.name} pagó <AmountNumber>{formatAmount(amount)}</AmountNumber> a{" "}
          {expense.paidBy.name}
        </p>

        <p className="text-xs">
          <span className="text-success">
            Está al día <CheckCircle className="mb-0.5 inline h-3 w-3" />
          </span>
          , pero pagó de más.{" "}
          <span className="text-d-foreground font-semibold">
            {expense.paidBy.name} le debe{" "}
            <AmountNumber size="xs">
              {formatAmount(parsedPersonalBalance)}
            </AmountNumber>
          </span>
        </p>
      </>
    )
  ) : debtSettled ? (
    isLoggedUser ? (
      <>
        <p className="text-s-foreground">
          Pagaste <AmountNumber>{formatAmount(amount)}</AmountNumber> a{" "}
          {expense.paidBy.name}
        </p>

        <p className="text-success text-xs">
          Estás al día <CheckCircle className="mb-0.5 inline h-3 w-3" />
        </p>
      </>
    ) : (
      <>
        {expense.paidById === loggedUser.id ? (
          <p className="text-s-foreground">
            {user.name} te pagó{" "}
            <AmountNumber>{formatAmount(amount)}</AmountNumber>
          </p>
        ) : (
          <p className="text-s-foreground">
            {user.name} pagó <AmountNumber>{formatAmount(amount)}</AmountNumber>{" "}
            a {expense.paidBy.name}
          </p>
        )}
        <p className="text-success text-xs">
          Está al día <CheckCircle className="mb-0.5 inline h-3 w-3" />
        </p>
      </>
    )
  ) : isLoggedUser ? (
    loggedUser.id === expense.paidById ? (
      <>
        <p className="text-d-foreground">
          {user.name} te debe{" "}
          <AmountNumber>{formatAmount(parsedPersonalBalance)}</AmountNumber>
        </p>

        {!!amount && (
          <p className="text-s-foreground text-xs">
            Ya pagó{" "}
            <AmountNumber size="xs">{formatAmount(amount)}</AmountNumber>
          </p>
        )}
      </>
    ) : (
      <>
        <p className="text-d-foreground">
          Debés{" "}
          <AmountNumber>{formatAmount(parsedPersonalBalance)}</AmountNumber> a{" "}
          {expense.paidBy.name}
        </p>

        {!!amount && (
          <p className="text-s-foreground text-xs">
            Ya pagaste{" "}
            <AmountNumber size="xs">{formatAmount(amount)}</AmountNumber>
          </p>
        )}
      </>
    )
  ) : loggedUser.id === expense.paidById ? (
    <>
      <p className="text-d-foreground">
        {user.name} te debe{" "}
        <AmountNumber>{formatAmount(parsedPersonalBalance)}</AmountNumber>
      </p>

      {!!amount && (
        <p className="text-s-foreground text-xs">
          Ya pagó <AmountNumber size="xs">{formatAmount(amount)}</AmountNumber>
        </p>
      )}
    </>
  ) : loggedUser.id !== user.id && loggedUser.id !== expense.paidById ? (
    <>
      <p className="text-d-foreground">
        {user.name} debe{" "}
        <AmountNumber>{formatAmount(parsedPersonalBalance)}</AmountNumber> a{" "}
        {expense.paidBy.name}
      </p>

      {!!amount && (
        <p className="text-s-foreground text-xs">
          Ya pagó <AmountNumber size="xs">{formatAmount(amount)}</AmountNumber>
        </p>
      )}
    </>
  ) : null;
