import Image from "next/image";

import clsx from "clsx";
import { Clock, HandCoins } from "lucide-react";
import type { Session } from "next-auth";

import type { SimplifiedDebt } from "@/lib/utils";

import AmountNumber from "@/components/AmountNumber";

interface CardProps {
  simplifiedDebt: SimplifiedDebt;
  loggedUser: Session["user"];
  containerClassName?: string;
}

const Card = ({
  simplifiedDebt,
  loggedUser,
  containerClassName,
}: CardProps) => {
  const { from, to, amount } = simplifiedDebt;

  const isDebtorUser = from.id === loggedUser.id;
  const isBillingUser = to.id === loggedUser.id;

  // Same green/amber/blue language as the expense balance cards: amber
  // means this row is a debt of yours (still to pay), blue means it's owed
  // to you (waiting to collect), and third-party debts (neither) stay
  // neutral since they're not "your" money either way.
  const owesMoney = isDebtorUser;
  const isOwedToThem = isBillingUser;

  return (
    <li
      className={clsx(
        "flex items-center justify-between gap-4 p-4",
        containerClassName,
      )}
    >
      <div className="flex items-center gap-x-3">
        {from.image && (
          <Image
            alt="User avatar"
            src={from.image}
            height={40}
            width={40}
            className="rounded-full"
          />
        )}

        <p className="text-sm">
          {isDebtorUser ? (
            <>
              Debés a <span className="font-semibold">{to.name}</span>
            </>
          ) : isBillingUser ? (
            <>
              <span className="font-semibold">{from.name}</span> te debe
            </>
          ) : (
            <>
              <span className="font-semibold">{from.name}</span> debe a{" "}
              <span className="font-semibold">{to.name}</span>
            </>
          )}
        </p>

        {!isBillingUser && to.image && (
          <Image
            alt="User avatar"
            src={to.image}
            height={40}
            width={40}
            className="rounded-full"
          />
        )}
      </div>

      <div className="flex flex-col items-end gap-y-0.5">
        {owesMoney && (
          <span className="text-warning text-xs font-semibold">Debés</span>
        )}

        <div
          className={clsx(
            "flex items-center gap-x-1.5 font-semibold",
            owesMoney ? "text-warning" : isOwedToThem ? "text-info" : undefined,
          )}
        >
          {owesMoney ? (
            <Clock className="h-4 w-4 flex-shrink-0" />
          ) : isOwedToThem ? (
            <HandCoins className="h-4 w-4 flex-shrink-0" />
          ) : null}

          <AmountNumber size="lg">{amount}</AmountNumber>
        </div>
      </div>
    </li>
  );
};

export default Card;
