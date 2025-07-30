import { useState } from "react";

import type { Session } from "next-auth";

import { CheckCircle, Clock, Scale } from "lucide-react";

import type { Expense, User } from "@/lib/api/types";
import { areAllDebtsSettled, sortParticipants } from "@/lib/utils";

import Badge from "@/components/Badge";
import Button from "@/components/Button";
import UpdateExpenseForm, {
  type UpdateExpenseFieldKeys,
} from "@/components/UpdateExpenseForm";
import { Card } from "./Card";

interface BalanceSectionProps {
  expense: Expense;
  loggedUser: Session["user"];
}

const BalanceSection = ({ expense, loggedUser }: BalanceSectionProps) => {
  const [fieldsToUpdate, setFieldsToUpdate] = useState<UpdateExpenseFieldKeys>(
    [],
  );
  const [selectedParticipant, setSelectedParticipant] = useState<User | null>(
    null,
  );
  const [amountToBeSettled, setAmountToBeSettled] = useState<number | null>(
    null,
  );
  const [isOpen, setIsOpen] = useState(false);

  const sortedParticipants = sortParticipants(
    expense?.participants,
    expense?.paidById,
  );
  const allDebtsSettled = areAllDebtsSettled(expense);
  const isUserEditor =
    loggedUser?.id === expense?.createdById ||
    loggedUser?.id === expense?.paidById;

  return (
    <>
      <section className="flex flex-col gap-y-8">
        <div className="flex items-center gap-x-1.5">
          <Scale className="h-8 w-8" />

          <h2 className="text-xl font-semibold">Balance</h2>

          <Badge
            color={allDebtsSettled ? "success" : "warning"}
            rightItem={
              allDebtsSettled ? (
                <CheckCircle className="-mr-1 h-3.5 w-3.5" />
              ) : (
                <Clock className="-mr-1 h-3.5 w-3.5" />
              )
            }
            className="ml-2"
          >
            {allDebtsSettled ? "Gasto completo" : "Incompleto"}
          </Badge>
        </div>

        <ul className="border-h-background flex flex-col border shadow-xl">
          {sortedParticipants.map((expenseParticipant, i) => (
            <Card
              key={i}
              {...{
                expenseParticipant,
                expense,
                loggedUser,
                setFieldsToUpdate,
                setSelectedParticipant,
                setAmountToBeSettled,
                setIsOpen,
                containerClassName: i % 2 ? "bg-background" : "bg-h-background",
              }}
            />
          ))}
        </ul>

        {isUserEditor && !allDebtsSettled && (
          <div className="flex justify-end">
            <Button
              aria-label="Add participant"
              onClick={() => {
                setFieldsToUpdate(["participantsToAdd"]);
                setIsOpen(true);
              }}
              color="secondary"
              variant="outlined"
            >
              Añadir participante/s
            </Button>
          </div>
        )}
      </section>

      {expense && loggedUser && (
        <UpdateExpenseForm
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          expense={expense}
          user={loggedUser}
          fieldsToUpdate={fieldsToUpdate}
          selectedParticipant={selectedParticipant}
          amountToBeSettled={amountToBeSettled}
        />
      )}
    </>
  );
};

export default BalanceSection;
