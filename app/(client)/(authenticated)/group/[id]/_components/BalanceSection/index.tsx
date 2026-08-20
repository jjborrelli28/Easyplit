import { useMemo } from "react";

import type { Group } from "@/lib/api/types";

import { ArrowLeftRight } from "lucide-react";
import type { Session } from "next-auth";

import { calculateBalances, simplifyDebts } from "@/lib/utils";

import clsx from "clsx";
import Card from "./Card";

interface BalanceSectionProps {
  group: Group;
  loggedUser: Session["user"];
}

const BalanceSection = ({ group, loggedUser }: BalanceSectionProps) => {
  const expenses = group.expenses;

  // A group's expense history has no upper bound (unlike members/
  // participants, capped at 20), so this is the one balance calculation
  // worth memoizing — otherwise every unrelated re-render redoes the full
  // O(expenses × participants) split + simplification pass.
  const simplifiedDebts = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    const debts = simplifyDebts(calculateBalances(expenses));

    // Whatever involves the person actually looking at this page should
    // surface first — everything else keeps its original relative order
    // (a plain .sort() with a two-way comparator is a stable sort).
    return [...debts].sort((a, b) => {
      const aInvolvesViewer =
        a.from.id === loggedUser.id || a.to.id === loggedUser.id;
      const bInvolvesViewer =
        b.from.id === loggedUser.id || b.to.id === loggedUser.id;

      if (aInvolvesViewer === bInvolvesViewer) return 0;

      return aInvolvesViewer ? -1 : 1;
    });
  }, [expenses, loggedUser.id]);

  if (simplifiedDebts.length === 0) return null;

  return (
    <>
      <hr className="border-h-background" />

      <section className="flex flex-col gap-y-8">
        <div className="flex items-center gap-x-1.5">
          <ArrowLeftRight className="h-8 w-8" />

          <h2 className="text-xl font-semibold">Deudas simplificadas</h2>
        </div>

        <ul className="border-h-background flex flex-col border shadow-xl">
          {simplifiedDebts.map((simplifiedDebt, i) => {
            // Only the very first row ever gets featured, and only when the
            // viewer is the one who owes (from) — that's the only case that
            // actually needs their action. Being owed money (to) isn't
            // something to act on, so it doesn't warrant the highlight even
            // when it's the viewer's own row.
            const isFeatured =
              i === 0 && simplifiedDebt.from.id === loggedUser.id;

            return (
              <Card
                key={i}
                simplifiedDebt={simplifiedDebt}
                loggedUser={loggedUser}
                containerClassName={clsx(
                  isFeatured ? "bg-h-background" : "bg-background",
                  i > 0 && "border-h-background border-t",
                )}
              />
            );
          })}
        </ul>
      </section>
    </>
  );
};

export default BalanceSection;
