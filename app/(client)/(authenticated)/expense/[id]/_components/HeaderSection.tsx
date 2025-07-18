import { useState } from "react";

import Link from "next/link";

import type { Session } from "next-auth";

import clsx from "clsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  BanknoteArrowUp,
  CalendarArrowUp,
  CalendarSync,
  Edit,
  Group,
  Repeat,
} from "lucide-react";

import type { Expense } from "@/lib/api/types";

import Button from "@/components/Button";
import {
  EXPENSE_TYPE,
  EXPENSE_TYPES,
} from "@/components/ExpenseTypeSelect/constants";
import UpdateExpenseForm, {
  UpdateExpenseFieldKeys,
} from "@/components/UpdateExpenseForm";

interface HeaderSectionProps {
  expense: Expense;
  loggedUser: Session["user"];
}

const HeaderSection = ({ expense, loggedUser }: HeaderSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fieldsToUpdate, setFieldsToUpdate] = useState<UpdateExpenseFieldKeys>(
    [],
  );

  const type = expense?.type ?? EXPENSE_TYPE.UNCATEGORIZED;
  const Icon = EXPENSE_TYPES[type].icon;

  return (
    <>
      <section className="grid grid-cols-1 items-center justify-center gap-y-4 2xl:grid-cols-[1fr_434px] 2xl:gap-8">
        <div className="flex items-center gap-x-4">
          <div
            className={clsx(
              "flex h-14 w-14 min-w-14 items-center justify-center rounded-full",
              EXPENSE_TYPES[type].color,
            )}
          >
            <Icon className="text-background h-8 w-8" />
          </div>

          <h1 className="truncate text-3xl font-bold">{expense.name}</h1>
        </div>

        <div className="flex flex-col gap-x-2 gap-y-1 lg:flex-row lg:items-center 2xl:justify-end">
          <p className="text-foreground/75 text-sm font-semibold">Monto:</p>

          <div className="text-primary flex max-w-[calc(100%_-_48px)] items-center gap-x-2 overflow-hidden font-semibold">
            <span className="text-3xl">$</span>

            <p className="truncate text-5xl">
              {expense.amount.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-y-2 2xl:col-span-2">
          <div className="text-foreground/75 flex items-center gap-x-2">
            <CalendarArrowUp className="h-5 w-5" />

            <p className="text-sm">
              Creado por{" "}
              <span className="font-semibold">{expense.createdBy?.name}</span>{" "}
              el{" "}
              <span className="font-semibold">
                {format(
                  new Date(expense.createdAt),
                  "dd 'de' MMMM 'del' yyyy",
                  {
                    locale: es,
                  },
                )}
              </span>
            </p>
          </div>

          <div className="text-foreground/75 group flex w-fit items-center gap-x-2">
            <BanknoteArrowUp className="h-5 w-5" />

            <p className="text-sm">
              Pagado por{" "}
              <span className="font-semibold">{expense.paidBy?.name}</span> el{" "}
              <span className="group-hover:text-primary font-semibold transition-colors duration-300">
                {format(
                  new Date(expense.paymentDate),
                  "dd 'de' MMMM 'del' yyyy",
                  { locale: es },
                )}
              </span>
            </p>

            <Button
              aria-label="Change payment date"
              onClick={() => {
                setFieldsToUpdate(["paymentDate"]);
                setIsOpen(true);
              }}
              unstyled
              className="text-primary pointer-events-none opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:cursor-pointer group-hover:opacity-100"
            >
              <Repeat className="h-5 w-5" />
            </Button>
          </div>

          <div className="text-foreground/75 flex items-center gap-x-2">
            <Group className="h-5 w-5" />

            {expense.groupId ? (
              <p className="text-sm">
                Este gasto pertenece al grupo{" "}
                <Link
                  href={`/group/${expense.groupId}`}
                  className="hover:text-primary cursor-pointer font-semibold transition-colors duration-300"
                >
                  {expense.group?.name}
                </Link>
              </p>
            ) : (
              <Button
                aria-label="Add expense to group"
                onClick={() => {
                  setFieldsToUpdate(["groupId"]);
                  setIsOpen(true);
                }}
                unstyled
                className="hover:text-primary cursor-pointer text-sm transition-colors duration-300"
              >
                ¿Deseas añadir este gasto a un grupo existente?
              </Button>
            )}
          </div>
        </div>
      </section>

      {expense && loggedUser && (
        <UpdateExpenseForm
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          expense={expense}
          user={loggedUser}
          fieldsToUpdate={fieldsToUpdate}
        />
      )}
    </>
  );
};

export default HeaderSection;
