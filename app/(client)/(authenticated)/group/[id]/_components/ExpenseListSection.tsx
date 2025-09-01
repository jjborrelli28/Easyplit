import { useState } from "react";

import type { Session } from "next-auth";

import type { Group } from "@/lib/api/types";

import Button from "@/components/Button";
import { CARD_TYPE } from "@/components/Card";
import PanelList from "@/components/PanelList";
import UpdateGroupForm, {
  type UpdateGroupFieldKeys,
} from "@/components/UpdateGroupForm";

interface ExpenseListSectionProps {
  group: Group;
  loggedUser: Session["user"];
}

const ExpenseListSection = ({ group, loggedUser }: ExpenseListSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fieldsToUpdate, setFieldsToUpdate] = useState<UpdateGroupFieldKeys>(
    [],
  );

  const isUserEditor = loggedUser?.id === group?.createdById;

  return (
    <>
      <section className="flex flex-col gap-y-8">
        <PanelList
          type={CARD_TYPE.EXPENSE}
          list={group.expenses}
          group={group}
          isActive
        />

        {isUserEditor && (
          <div className="flex justify-end">
            <Button
              aria-label="Add participant"
              onClick={() => {
                setFieldsToUpdate(["expensesToAdd"]);
                setIsOpen(true);
              }}
              color="secondary"
              variant="outlined"
            >
              Añadir gasto/s
            </Button>
          </div>
        )}
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
    </>
  );
};

export default ExpenseListSection;
