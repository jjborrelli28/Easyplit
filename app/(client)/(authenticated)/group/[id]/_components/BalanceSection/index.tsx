import type { Group } from "@/lib/api/types";

import { HandCoins } from "lucide-react";
import type { Session } from "next-auth";

import { calculateBalances, simplifyDebts } from "@/lib/utils";

import Card from "./Card";

interface BalanceSectionProps {
  group: Group;
  loggedUser: Session["user"];
}

const BalanceSection = ({ group, loggedUser }: BalanceSectionProps) => {
  const expenses = group.expenses;

  if (!expenses || expenses?.length === 0) return null;

  const balances = calculateBalances(expenses);
  const simplifiedDebts = simplifyDebts(balances);

  if (simplifiedDebts.length === 0) return null;

  return (
    <>
      <hr className="border-h-background" />

      <section className="flex flex-col gap-y-8">
        <div className="flex items-center gap-x-1.5">
          <HandCoins className="h-8 w-8" />

          <h2 className="text-xl font-semibold">Deudas simplificadas</h2>
        </div>

        <ul className="flex flex-col">
          {simplifiedDebts.map((simplifiedDebt, i) => (
            <Card
              key={i}
              simplifiedDebt={simplifiedDebt}
              loggedUser={loggedUser}
            />
          ))}
        </ul>
      </section>
    </>
  );
};

export default BalanceSection;
