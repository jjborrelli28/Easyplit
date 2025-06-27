import { type FormEvent, useState } from "react";

import { useSession } from "next-auth/react";

import useCreateGroup from "@/hooks/groups/useCreateGroup";
import type { ResponseMessage, UserData } from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";
import { parseZodErrors } from "@/lib/validations/helpers";
import { nameSchema } from "@/lib/validations/schemas";

import useCreateExpense from "@/hooks/expenses/useCreateExpense";
import AmountInput, { initialAmoutValue } from "../AmountInput";
import Badge from "../Badge";
import Button from "../Button";
import Input from "../Input";
import MessageCard from "../MessageCard";
import Modal, { type ModalProps } from "../Modal";
import UserSearchEngine from "../UserSearchEngine";

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
  const { data } = useSession();

  const { mutate: createExpense, isPending: expenseIsPending } =
    useCreateExpense();
  const { mutate: createGroup, isPending: groupIsPending } = useCreateGroup();

  const [actionName, setActionName] = useState("");
  const [members, setMembers] = useState<UserData[]>([]);
  const [amount, setAmount] = useState(initialAmoutValue);

  const [fieldErrors, setFieldErrors] = useState<{
    actionName?: string | null;
  }>(initialFieldErrors);
  const [responseError, setResponseError] = useState<string[] | null>(null);

  const [message, setMessage] = useState<ResponseMessage | null>(null);

  const createdById = data?.user.id;
  const isLoading = expenseIsPending || groupIsPending;

  const handleSubmitAction = (e: FormEvent) => {
    e.preventDefault();

    if (!createdById)
      return setResponseError([
        "No se pudo crear el grupo porque no se encontró un usuario autenticado.",
        "Por favor, iniciá sesión e intentá nuevamente.",
      ]);

    if (type === ACTION_TYPE.CREATE_EXPENSE) {
      const participantIds = [
        createdById,
        ...members.map((member) => member.id),
      ];
      const body = {
        name: actionName,
        createdById,
        amount: parseFloat(amount.replace(",", ".")),
        participantIds,
      };

      createExpense(body, {
        onSuccess: (res) => {
          setResponseError(null);
          res?.message && setMessage(res.message);
        },
        onError: (res) => {
          const {
            error: { message, fields },
          } = res.response.data;

          if (fields) {
            setFieldErrors({
              ...initialFieldErrors,
              ...fields,
            });
          } else {
            setResponseError(message);
          }
        },
      });
    } else {
      const memberIds = [createdById, ...members.map((member) => member.id)];
      const body = { name: actionName, createdById, memberIds };

      createGroup(body, {
        onSuccess: (res) => {
          setResponseError(null);
          res?.message && setMessage(res.message);
        },
        onError: (res) => {
          const {
            error: { message, fields },
          } = res.response.data;

          if (fields) {
            setFieldErrors({
              ...initialFieldErrors,
              ...fields,
            });
          } else {
            setResponseError(message);
          }
        },
      });
    }
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
    setMessage(null);
    onClose();
  };

  return (
    <Modal
      onClose={handleClose}
      showHeader={!message}
      title={
        type === ACTION_TYPE.CREATE_EXPENSE
          ? "Crear un gasto"
          : "Crear un grupo"
      }
      {...restProps}
    >
      {message ? (
        <MessageCard
          {...message}
          icon={ICON_MAP[message.icon]}
          countdown={{
            color: message.color,
            start: 3,
            onComplete: () => handleClose(),
          }}
        >
          {message.content}
        </MessageCard>
      ) : (
        <form onSubmit={handleSubmitAction} className="flex flex-col gap-y-8">
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
                      color="info"
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

          <Button type="submit" loading={isLoading} fullWidth>
            Crear
          </Button>
        </form>
      )}
    </Modal>
  );
};

export default ActionModal;
