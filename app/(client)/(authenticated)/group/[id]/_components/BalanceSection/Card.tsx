import Image from "next/image";

import clsx from "clsx";
import type { Session } from "next-auth";

import type { SimplifiedDebt } from "@/lib/utils";

import AmountNumber from "@/components/AmountNumber";

interface CardProps {
  simplifiedDebt: SimplifiedDebt;
  loggedUser: Session["user"];
}
const Card = ({ simplifiedDebt, loggedUser }: CardProps) => {
  const { from, to, amount } = simplifiedDebt;

  const isDebtorUser = from.id === loggedUser.id;
  const isBillingUser = to.id === loggedUser.id;

  return (
    <li className="py-2">
      <p className="align-middle">
        {from.image && (
          <Image
            alt="User avatar"
            src={from.image}
            height={28}
            width={28}
            className="mr-2 mb-1 inline-block rounded-full"
          />
        )}
        {isDebtorUser ? (
          <>Debés</>
        ) : isBillingUser ? (
          <>
            <span className="font-semibold">{from.name}</span> te debe
          </>
        ) : (
          <>
            <span className="font-semibold">{from.name}</span> debe
          </>
        )}{" "}
        <AmountNumber
          className={clsx("text-d-foreground", isBillingUser && "mr-1")}
        >
          {amount}
        </AmountNumber>{" "}
        {!isBillingUser && <span className="mr-2">a</span>}
        {!isBillingUser && to.image && (
          <Image
            alt="User avatar"
            src={to.image}
            height={28}
            width={28}
            className="mr-2 mb-1 inline-block rounded-full"
          />
        )}
        {!isBillingUser && <span className="font-semibold">{to.name}</span>}
      </p>
    </li>
  );
};

export default Card;
