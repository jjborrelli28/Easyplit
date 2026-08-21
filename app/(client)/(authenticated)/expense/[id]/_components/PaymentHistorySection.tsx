"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  BanknoteArrowUp,
  CircleChevronDown,
  History,
  UserMinus,
} from "lucide-react";

import useGetExpenseHistory, {
  type ExpenseHistoryEntry,
} from "@/hooks/data/expense/useGetExpenseHistory";

import type { Expense } from "@/lib/api/types";

import AmountNumber from "@/components/AmountNumber";
import Button from "@/components/Button";
import Collapse from "@/components/Collapse";

interface PaymentHistorySectionProps {
  expense: Expense;
}

interface PaymentActivity {
  type: "payment";
  id: string;
  participantName: string;
  isCurrentParticipant: boolean;
  amount: number;
  createdAt: Date;
  recordedByName: string | null;
  recordedBySelf: boolean;
}

interface RemovalActivity {
  type: "removal";
  id: string;
  participantName: string;
  isVirtualParticipant: boolean;
  amount: number;
  createdAt: Date;
  removedByName: string | null;
  removedBySelf: boolean;
}

type Activity = PaymentActivity | RemovalActivity;

// `field`'s oldValue/newValue are JSON.stringify'd by getUpdatedExpenseFields.
// Both "participantPayment" and "participantToRemove" entries denormalize
// the participant's name (and, for removals, what they had contributed) at
// the time of the action — a participant can later be removed from the
// expense entirely, and without that saved here, reading this history
// afterward would show an unresolvable id with no explanation of who that
// was or what happened to them.
const parseActivity = (
  history: ExpenseHistoryEntry[] | undefined,
  expense: Expense,
): Activity[] => {
  if (!history) return [];

  return history
    .map((entry): Activity | null => {
      if (entry.field === "participantPayment") {
        let payload: { userId?: string; amount?: number; name?: string } = {};

        try {
          payload = entry.newValue ? JSON.parse(entry.newValue) : {};
        } catch {
          payload = {};
        }

        if (!payload.amount) return null;

        const currentParticipant = expense.participants.find(
          (p) => p.userId === payload.userId,
        );

        return {
          type: "payment",
          id: entry.id,
          participantName:
            payload.name ?? currentParticipant?.user.name ?? "Un participante",
          isCurrentParticipant: !!currentParticipant,
          amount: payload.amount,
          createdAt: new Date(entry.createdAt),
          recordedByName: entry.updatedBy?.name ?? null,
          recordedBySelf: entry.updatedBy?.id === payload.userId,
        };
      }

      if (entry.field === "participantToRemove") {
        let payload: {
          userId?: string;
          name?: string;
          amount?: number;
          isVirtual?: boolean;
        } = {};

        try {
          payload = entry.newValue ? JSON.parse(entry.newValue) : {};
        } catch {
          payload = {};
        }

        // A legitimate removal always has a userId — this also filters out
        // pre-existing phantom entries from a since-fixed bug where every
        // unrelated update (e.g. registering a payment) spuriously logged
        // an empty "participant removed" entry alongside it.
        if (!payload.userId) return null;

        return {
          type: "removal",
          id: entry.id,
          participantName: payload.name ?? "Un participante",
          isVirtualParticipant: !!payload.isVirtual,
          amount: payload.amount ?? 0,
          createdAt: new Date(entry.createdAt),
          removedByName: entry.updatedBy?.name ?? null,
          removedBySelf: entry.updatedBy?.id === payload.userId,
        };
      }

      return null;
    })
    .filter((activity): activity is Activity => activity !== null);
};

const PaymentHistorySection = ({ expense }: PaymentHistorySectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: history } = useGetExpenseHistory(expense.id);

  const activity = parseActivity(history, expense);

  const containerRef = useRef<HTMLDivElement>(null);
  // useWindowVirtualizer measures scroll against the whole page, so it needs
  // to know how far down the page this list actually starts — without this,
  // it assumes the list starts at the very top of the document, which
  // (since this section sits well below the header/balance above it) makes
  // it think the wrong items are in view while scrolling.
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setScrollMargin(containerRef.current.offsetTop);
    }
    // Re-measure on open too: the section starts collapsed, and re-checking
    // once it's actually expanded guards against the page above it having
    // shifted (e.g. other content finishing its own layout) in the meantime.
  }, [isOpen]);

  const virtualizer = useWindowVirtualizer({
    count: activity.length > 0 ? activity.length : 1,
    estimateSize: () => 71,
    gap: 0,
    overscan: 5,
    scrollMargin,
  });

  if (activity.length === 0) return null;

  return (
    <section className="flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-1.5">
          <History className="h-8 w-8 min-w-8" />

          <h2 className="text-xl font-semibold">Historial de pagos</h2>
        </div>

        <Button
          aria-label="Toggle payment history"
          onClick={() => setIsOpen((prev) => !prev)}
          unstyled
          className="flex w-fit cursor-pointer items-center"
        >
          <CircleChevronDown
            className={clsx(
              "h-6 w-6 transition-transform duration-300",
              isOpen && "-rotate-180",
            )}
          />
        </Button>
      </div>

      <Collapse
        isOpen={isOpen}
        className={clsx(
          "transition-[grid-template-rows,opacity,margin-top]",
          isOpen && "mt-4",
        )}
        contentStyle={{
          height: `${isOpen ? virtualizer.getTotalSize() : 0}px`,
        }}
      >
        <div
          ref={containerRef}
          className="border-h-background relative flex w-full flex-col border shadow-xl"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = activity[virtualItem.index];

            if (!item) return null;

            return (
              <div
                ref={virtualizer.measureElement}
                key={virtualItem.key}
                data-index={virtualItem.index}
                className={clsx(
                  "absolute top-0 left-0 flex w-full items-center justify-between gap-4 p-4",
                  virtualItem.index % 2 === 0 && "bg-h-background",
                )}
                style={{
                  transform: `translateY(${virtualItem.start - scrollMargin}px)`,
                }}
              >
                <div className="flex flex-col gap-y-0.5">
                  <p className="text-sm">
                    <span className="font-semibold">
                      {item.participantName}
                    </span>{" "}
                    {item.type === "payment"
                      ? "registró un pago"
                      : "fue eliminado del gasto"}
                    {item.type === "payment" && !item.isCurrentParticipant && (
                      <span className="text-foreground/75">
                        {" "}
                        (ya no participa del gasto)
                      </span>
                    )}
                    {item.type === "removal" && item.isVirtualParticipant && (
                      <span className="text-foreground/75"> (usuario virtual)</span>
                    )}
                  </p>

                  <p className="text-foreground/75 text-xs">
                    {format(item.createdAt, "dd 'de' MMMM 'del' yyyy, HH:mm", {
                      locale: es,
                    })}
                    {item.type === "payment" &&
                      !item.recordedBySelf &&
                      item.recordedByName &&
                      ` — registrado por ${item.recordedByName}`}
                    {item.type === "removal" &&
                      !item.removedBySelf &&
                      item.removedByName &&
                      ` — eliminado por ${item.removedByName}`}
                  </p>
                </div>

                {item.type === "payment" ? (
                  <p className="text-success flex items-center gap-x-1.5 font-semibold">
                    <BanknoteArrowUp className="h-5 w-5 flex-shrink-0" />
                    <AmountNumber size="lg">{item.amount}</AmountNumber>
                  </p>
                ) : item.amount > 0 ? (
                  <p className="text-danger flex items-center gap-x-1.5 font-semibold">
                    <UserMinus className="h-5 w-5 flex-shrink-0" />
                    <AmountNumber size="lg">{item.amount}</AmountNumber>
                  </p>
                ) : (
                  <UserMinus className="text-danger h-6 w-6 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </Collapse>
    </section>
  );
};

export default PaymentHistorySection;
