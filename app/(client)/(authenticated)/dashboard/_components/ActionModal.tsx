import { type FormEvent, useState } from "react";

import type { UserData } from "@/lib/api/types";
import { parseZodErrors } from "@/lib/validations/helpers";
import { nameSchema } from "@/lib/validations/schemas";

import AmountInput, { initialAmoutValue } from "@/components/AmountInput";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal, { type ModalProps } from "@/components/Modal";
import UserSearchEngine from "@/components/UserSearchEngine";

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
  const [amount, setAmount] = useState(initialAmoutValue);

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

  const handleClose = () => {
    setActionName("");
    setMembers([]);
    setAmount(initialAmoutValue);

    onClose();
  };

  return (
    <Modal
      onClose={handleClose}
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
          label={
            type === ACTION_TYPE.CREATE_EXPENSE
              ? "Nombre del gasto"
              : "Nombre del grupo"
          }
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

        <div className="flex flex-col gap-y-4">
          <UserSearchEngine
            placeholder="Buscar personas..."
            onSelect={handleSelect}
            excludeUserIds={members.map((u) => u.id)}
          />

          {members.length > 0 && (
            <div className="flex flex-col gap-y-4">
              <p className="text-primary text-sm font-semibold">
                Integrantes del{" "}
                {type === ACTION_TYPE.CREATE_EXPENSE ? "gasto" : "grupo"}
              </p>

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
            </div>
          )}
        </div>

        {type === ACTION_TYPE.CREATE_EXPENSE && (
          <AmountInput label="Monto" value={amount} onChange={setAmount} />
        )}

        <Button type="submit" fullWidth>
          Crear
        </Button>
      </form>
    </Modal>
  );
};

export default ActionModal;
