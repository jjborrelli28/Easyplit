import { type FormEvent, useState } from "react";

import type { UserData } from "@/lib/api/types";
import { parseZodErrors } from "@/lib/validations/helpers";
import { nameSchema } from "@/lib/validations/schemas";

import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal, { type ModalProps } from "@/components/Modal";
import UserSearchEngine from "@/components/UserSearchEngine";
import Badge from "@/components/Badge";

export enum ACTION_TYPE {
  CREATE_EXPENSE = "CREATE_EXPENSE",
  CREATE_GROUP = "CREATE_GROUP",
}

const initialFieldErrors = {
  actionName: null,
};

interface ActionModalProps extends Omit<ModalProps, "children"> {
  type: ACTION_TYPE | null;
}

const ActionModal = ({ type, onClose, ...restProps }: ActionModalProps) => {
  const [actionName, setActionName] = useState("");
  const [members, setMembers] = useState<UserData[]>([]);

  const [fieldErrors, setFieldErrors] = useState<{
    actionName?: string | null;
  }>(initialFieldErrors);

  const handleAction = (e: FormEvent) => {
    e.preventDefault();
  };

  const handleSelect = (user: UserData) => {
    setMembers((prevState) => [...prevState, user]);
  };

  const handleRemove = (idToRemove: string) => {
    setMembers((prevState) =>
      prevState.filter((member) => member.id !== idToRemove),
    );
  };

  return (
    <Modal
      onClose={() => onClose()}
      //     showHeader={!message}
      title={
        type === ACTION_TYPE.CREATE_EXPENSE
          ? "Crear un gasto"
          : "Crear un grupo"
      }
      {...restProps}
    >
      <form onSubmit={handleAction} className="flex flex-col gap-y-8">
        <Input
          id="name"
          type="text"
          placeholder={
            type === ACTION_TYPE.CREATE_EXPENSE
              ? "Nombre del gasto"
              : "Nombre del grupo"
          }
          value={actionName}
          onChange={(e) => {
            const name = e.target.value;

            setActionName(name);

            const verifiedField = nameSchema.safeParse({
              name,
            });

            if (verifiedField.success) {
              setFieldErrors((prevState) => ({
                ...prevState,
                name: null,
              }));
            } else {
              const fields = parseZodErrors(verifiedField.error);

              setFieldErrors({
                ...initialFieldErrors,
                ...fields,
              });
            }
          }}
          autoComplete="action-name"
          required
          error={fieldErrors.actionName}
        />

        <UserSearchEngine
          placeholder={`Añadir integrantes al ${type === ACTION_TYPE.CREATE_EXPENSE ? "gasto" : "grupo"}`}
          onSelect={handleSelect}
          excludeUserIds={members.map((u) => u.id)}
        />

        {members.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {members.map((member, i) => (
              <Badge
                key={i}
                onClick={() => handleRemove(member.id)}
                color="secondary"
              >
                {member.name}
              </Badge>
            ))}
          </div>
        )}

        <Button type="submit">Crear</Button>
      </form>
    </Modal>
  );
};

export default ActionModal;
