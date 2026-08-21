import { useMemo } from "react";

import type { Session } from "next-auth";

import {
  Banknote,
  Clock,
  HandCoins,
  Receipt,
  type LucideIcon,
} from "lucide-react";

import useWindowsDimensions from "@/hooks/useWindowsDimensions";
import type { Expense } from "@/lib/api/types";
import {
  getPersonalBalance,
  getPositiveTruncatedNumber,
  getTotalAmountOfExpenses,
  getTotalPaidByParticipants,
} from "@/lib/utils";

import AmountNumber from "@/components/AmountNumber";
import PaymentDonutChart from "@/components/Charts/PaymentDonutChart";
import Tooltip from "@/components/Tooltip";

interface StatsSectionProps {
  expenses: Expense[];
  loggedUser: Session["user"];
}

interface Tile {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
}

const StatsSection = ({ expenses, loggedUser }: StatsSectionProps) => {
  const { width } = useWindowsDimensions();

  const { totalAmount, totalPaid, youOwe, owedToYou } = useMemo(() => {
    let owe = 0;
    let owed = 0;

    expenses.forEach((expense) => {
      const isPayer = expense.paidById === loggedUser.id;

      if (isPayer) {
        owed += expense.participants.reduce((sum, participant) => {
          if (participant.userId === expense.paidById) return sum;

          const balance = getPersonalBalance(
            participant.amount,
            expense.amount,
            expense.participants.length,
          );

          return sum + Math.max(0, balance);
        }, 0);
      } else {
        const participant = expense.participants.find(
          (p) => p.userId === loggedUser.id,
        );

        if (participant) {
          const balance = getPersonalBalance(
            participant.amount,
            expense.amount,
            expense.participants.length,
          );

          if (Math.round(balance * 100) > 0) owe += balance;
        }
      }
    });

    return {
      totalAmount: getTotalAmountOfExpenses(expenses) ?? 0,
      totalPaid: getTotalPaidByParticipants(expenses),
      youOwe: getPositiveTruncatedNumber(owe),
      owedToYou: getPositiveTruncatedNumber(owed),
    };
  }, [expenses, loggedUser.id]);

  const isMobile = width < 1024;

  const tiles: Tile[] = [
    {
      icon: Receipt,
      label: "Gastos registrados",
      value: (
        <p className="text-2xl font-bold lg:text-3xl">{expenses.length}</p>
      ),
    },
    {
      icon: Banknote,
      label: "Monto total",
      value: (
        <Tooltip
          content={<AmountNumber size="md">{totalAmount}</AmountNumber>}
          color="info"
          containerClassName="block w-fit max-w-full"
        >
          <AmountNumber
            size={isMobile ? "2xl" : "3xl"}
            className="text-primary block w-fit truncate"
          >
            {totalAmount}
          </AmountNumber>
        </Tooltip>
      ),
    },
    {
      icon: Clock,
      label: "Debés",
      value: (
        <Tooltip
          content={<AmountNumber size="md">{youOwe}</AmountNumber>}
          color="info"
          containerClassName="block w-fit max-w-full"
        >
          <AmountNumber
            size={isMobile ? "2xl" : "3xl"}
            className="text-warning block w-fit truncate"
          >
            {youOwe}
          </AmountNumber>
        </Tooltip>
      ),
    },
    {
      icon: HandCoins,
      label: "Te deben",
      value: (
        <Tooltip
          content={<AmountNumber size="md">{owedToYou}</AmountNumber>}
          color="info"
          containerClassName="block  w-fit max-w-full"
        >
          <AmountNumber
            size={isMobile ? "2xl" : "3xl"}
            className="text-info block w-fit truncate"
          >
            {owedToYou}
          </AmountNumber>
        </Tooltip>
      ),
    },
  ];

  return (
    <section className="flex flex-col items-center gap-4 xl:flex-row xl:items-stretch xl:justify-between">
      <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-2">
        {tiles.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="border-h-background flex flex-col gap-y-3 border p-4"
          >
            <div className="text-foreground/75 flex items-center gap-x-2">
              <Icon className="h-5 w-5 min-w-5" />

              <p className="text-sm font-semibold">{label}</p>
            </div>

            {value}
          </div>
        ))}
      </div>

      {totalAmount > 0 && (
        <div className="border-h-background w-full border p-4 xl:w-auto">
          <PaymentDonutChart
            totalLabel="Pendiente"
            total={totalAmount}
            paidLabel="Cubierto"
            paid={totalPaid}
          />
        </div>
      )}
    </section>
  );
};

export default StatsSection;
