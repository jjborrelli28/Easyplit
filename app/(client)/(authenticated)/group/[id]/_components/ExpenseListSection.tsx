import { useState } from "react";

import type { Session } from "next-auth";

import type { Group } from "@/lib/api/types";

import ActionModal, { ACTION_TYPE } from "@/components/ActionModal";
import Button from "@/components/Button";
import { CARD_TYPE } from "@/components/Card";
import PanelList from "@/components/PanelList";
import UpdateGroupForm, {
  type UpdateGroupFieldKeys,
} from "@/components/UpdateGroupForm";
import clsx from "clsx";

interface ExpenseListSectionProps {
  group: Group;
  loggedUser: Session["user"];
}

const ExpenseListSection = ({ group, loggedUser }: ExpenseListSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fieldsToUpdate, setFieldsToUpdate] = useState<UpdateGroupFieldKeys>(
    [],
  );
  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);
  const [isExpenseListOpen, setIsExpenseListOpen] = useState(true);

  return (
    <>
      <section className="flex flex-col">
        <div className="mb-8 flex flex-wrap justify-end gap-4">
          <Button
            aria-label="Create expense"
            onClick={() => setIsCreateExpenseOpen(true)}
          >
            Crear gasto
          </Button>

          <Button
            variant="outlined"
            aria-label="Add expense"
            onClick={() => {
              setFieldsToUpdate(["expensesToAdd"]);
              setIsOpen(true);
            }}
          >
            Añadir gastos
          </Button>
        </div>

        <hr className="border-h-background mb-4" />

        <PanelList
          type={CARD_TYPE.EXPENSE}
          list={group.expenses}
          group={group}
          isActive={isExpenseListOpen}
          handleTogglePanel={() => setIsExpenseListOpen((prev) => !prev)}
          forceOpenOnDesktop={false}
          headerClassName={clsx("transition-all", !isExpenseListOpen && "pb-0")}
        />
      </section>

      {group && loggedUser && (
        <UpdateGroupForm
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          group={group}
          user={loggedUser}
          fieldsToUpdate={fieldsToUpdate}
        />
      )}

      <ActionModal
        type={ACTION_TYPE.CREATE_EXPENSE}
        user={loggedUser}
        group={group}
        isOpen={isCreateExpenseOpen}
        onClose={() => setIsCreateExpenseOpen(false)}
      />
    </>
  );
};

export default ExpenseListSection;
