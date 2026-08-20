"use client";

import { useState } from "react";

import clsx from "clsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronDown, History } from "lucide-react";

import useGetExpenseHistory from "@/hooks/data/expense/useGetExpenseHistory";

import type { Expense } from "@/lib/api/types";

import AmountNumber from "@/components/AmountNumber";
import Button from "@/components/Button";
import Collapse from "@/components/Collapse";

interface PaymentHistorySectionProps {
  expense: Expense;
}

interface PaymentEntry {
  id: string;
  participantName: string;
  amount: number;
  createdAt: Date;
  recordedByName: string | null;
  recordedBySelf: boolean;
}

// `field`'s oldValue/newValue are JSON.stringify'd by getUpdatedExpenseFields
// — for "participantPayment", newValue is exactly the {userId, amount} that
// was submitted (the amount of THIS payment, not the participant's new
// running total), which is exactly what a payment log entry needs.
const parsePaymentEntries = (
  history: ReturnType<typeof useGetExpenseHistory>["data"],
  expense: Expense,
): PaymentEntry[] => {
  if (!history) return [];

  return history
    .filter((entry) => entry.field === "participantPayment")
    .map((entry) => {
      let payload: { userId?: string; amount?: number } = {};

      try {
        payload = entry.newValue ? JSON.parse(entry.newValue) : {};
      } catch {
        payload = {};
      }

      const participant = expense.participants.find(
        (p) => p.userId === payload.userId,
      );

      return {
        id: entry.id,
        participantName: participant?.user.name ?? "Un participante",
        amount: payload.amount ?? 0,
        createdAt: new Date(entry.createdAt),
        recordedByName: entry.updatedBy?.name ?? null,
        recordedBySelf: entry.updatedBy?.id === payload.userId,
      };
    })
    .filter((payment) => payment.amount > 0);
};

const PaymentHistorySection = ({ expense }: PaymentHistorySectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: history } = useGetExpenseHistory(expense.id);

  const payments = parsePaymentEntries(history, expense);

  if (payments.length === 0) return null;

  return (
    <section className="flex flex-col gap-y-4">
      <Button
        aria-label="Toggle payment history"
        onClick={() => setIsOpen((prev) => !prev)}
        unstyled
        className="flex w-fit cursor-pointer items-center gap-x-1.5"
      >
        <History className="h-8 w-8" />

        <h2 className="text-xl font-semibold">Historial de pagos</h2>

        <ChevronDown
          className={clsx(
            "h-5 w-5 transition-transform duration-300",
            isOpen && "-rotate-180",
          )}
        />
      </Button>

      <Collapse isOpen={isOpen}>
        <ul className="border-h-background flex flex-col border shadow-xl">
          {payments.map((payment, i) => (
            <li
              key={payment.id}
              className={clsx(
                "flex items-center justify-between gap-4 p-4",
                i === 0 ? "bg-h-background" : "bg-background",
                i > 0 && "border-h-background border-t",
              )}
            >
              <div className="flex flex-col gap-y-0.5">
                <p className="text-sm">
                  <span className="font-semibold">
                    {payment.participantName}
                  </span>{" "}
                  registró un pago
                </p>

                <p className="text-foreground/75 text-xs">
                  {format(payment.createdAt, "dd 'de' MMMM 'del' yyyy, HH:mm", {
                    locale: es,
                  })}
                  {!payment.recordedBySelf &&
                    payment.recordedByName &&
                    ` — registrado por ${payment.recordedByName}`}
                </p>
              </div>

              <AmountNumber size="lg" className="text-primary">
                {payment.amount}
              </AmountNumber>
            </li>
          ))}
        </ul>
      </Collapse>
    </section>
  );
};

export default PaymentHistorySection;
