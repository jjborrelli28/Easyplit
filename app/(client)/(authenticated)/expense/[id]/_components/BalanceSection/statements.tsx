import type { Session } from "next-auth";

import type { Expense, User } from "@/lib/api/types";

import AmountNumber from "@/components/AmountNumber";

export const PayerStatement = ({
  isLoggedUser,
  user,
  expense,
}: {
  isLoggedUser: boolean;
  user: User;
  expense: Expense;
}) => (
  <>
    <p className="font-semibold">
      {isLoggedUser
        ? "Cubriste el gasto completo"
        : `${user.name} cubrió el gasto completo`}
    </p>

    {/* Always present (unlike DebtorStatement's payment subtext, which only
    shows up once someone's paid something) so every row in the list keeps
    the same height regardless of debt state. */}
    <p className="text-foreground/75 text-xs">
      {isLoggedUser ? "Pagaste" : "Pagó"}{" "}
      <AmountNumber size="xs">{expense.amount}</AmountNumber>
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
  hasACreditBalance,
}: {
  debtSettled: boolean;
  isLoggedUser: boolean;
  amount: number;
  expense: Expense;
  loggedUser: Session["user"];
  user: User;
  hasACreditBalance: boolean;
}) => {
  // DebtorStatement only renders when user.id !== expense.paidById (Card.tsx
  // picks PayerStatement otherwise), so isLoggedUser and payerIsViewer can
  // never both be true here — there's no "you owe yourself" case.
  const payerIsViewer = loggedUser.id === expense.paidById;

  const headline = hasACreditBalance
    ? isLoggedUser
      ? "Pagaste de más"
      : payerIsViewer
        ? `${user.name} te pagó de más`
        : `${user.name} pagó de más a ${expense.paidBy.name}`
    : debtSettled
      ? isLoggedUser
        ? "Ya pagaste tu parte"
        : payerIsViewer
          ? `${user.name} ya te pagó`
          : `${user.name} ya le pagó a ${expense.paidBy.name}`
      : isLoggedUser
        ? `Debés a ${expense.paidBy.name}`
        : payerIsViewer
          ? `${user.name} te debe`
          : `${user.name} debe a ${expense.paidBy.name}`;

  // Always rendered, even at $0 (unpaid), so every row in the list keeps the
  // same height regardless of how much this participant has paid so far.
  const paymentSubtext = amount
    ? `${isLoggedUser ? "Ya pagaste" : `${user.name} ya pagó`}`
    : isLoggedUser
      ? "Todavía no pagaste nada"
      : `${user.name} todavía no pagó nada`;

  return (
    <>
      <p className="font-semibold">{headline}</p>

      <p className="text-foreground/75 text-xs">
        {paymentSubtext}
        {!!amount && (
          <>
            {" "}
            <AmountNumber size="xs">{amount}</AmountNumber>
          </>
        )}
      </p>
    </>
  );
};
