import { type FormEvent, useState } from "react";

import { useSession } from "next-auth/react";

import useCreateExpense from "@/hooks/expense/useCreateExpense";
import useCreateGroup from "@/hooks/group/useCreateGroup";

import type { ResponseMessage, User } from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";

import AmountInput, { initialAmoutValue } from "../AmountInput";
import Badge from "../Badge";
import Button from "../Button";
import FormErrorMessage from "../FormErrorMessage";
import GroupTypeSelector, { GROUP_TYPE } from "../GroupTypeSelector";
import Input from "../Input";
import MessageCard from "../MessageCard";
import Modal, { type ModalProps } from "../Modal";
import UserSearchEngine from "../UserSearchEngine";

export enum ACTION_TYPE {
  CREATE_EXPENSE = "CREATE_EXPENSE",
  CREATE_GROUP = "CREATE_GROUP",
}

const initialFieldErrors = {
  name: null,
  participantIds: null,
  memberIds: null,
  amount: null,
  groupType: null,
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
  const [participants, setParticipants] = useState<User[]>([]);
  const [amount, setAmount] = useState(initialAmoutValue);
  const [groupType, setGroupType] = useState<GROUP_TYPE | undefined>();

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string | null;
    participantIds?: string | null;
    memberIds?: string | null;
    amount?: string | null;
    groupType?: string | null;
  }>(initialFieldErrors);
  const [responseError, setResponseError] = useState<string[] | null>(null);

  const [message, setMessage] = useState<ResponseMessage | null>(null);

  const createdById = data?.user.id;
  const isLoading = expenseIsPending || groupIsPending;

  const handleSubmitAction = (e: FormEvent) => {
    e.preventDefault();

    setFieldErrors(initialFieldErrors);
    setResponseError(null);

    if (!createdById)
      return setResponseError([
        "No se pudo crear el grupo porque no se encontró un usuario autenticado.",
        "Por favor, iniciá sesión e intentá nuevamente.",
      ]);

    if (type === ACTION_TYPE.CREATE_EXPENSE) {
      const participantIds = [
        createdById,
        ...participants.map((member) => member.id),
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
      const memberIds = [
        createdById,
        ...participants.map((member) => member.id),
      ];
      const body = {
        name: actionName,
        type: groupType,
        createdById,
        memberIds,
      };

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
              ...(fields?.type && { groupType: fields.type }),
              ...fields,
            });
          } else {
            setResponseError(message);
          }
        },
      });
    }
  };

  const handleSelect = (user: User) => {
    setParticipants((prevState) => [...prevState, user]);
  };

  const handleRemove = (idToRemove: string) => {
    setParticipants((prevState) =>
      prevState.filter((member) => member.id !== idToRemove),
    );
  };

  const handleClose = () => {
    setActionName("");
    setParticipants([]);
    setFieldErrors(initialFieldErrors);
    setResponseError(null);
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
            }}
            autoComplete="action-name"
            required
            error={fieldErrors.name}
          />

          <div className="flex flex-col gap-y-4">
            <UserSearchEngine
              placeholder="Buscar personas..."
              onSelect={handleSelect}
              excludeUserIds={participants.map((u) => u.id)}
              error={fieldErrors.participantIds ?? fieldErrors.memberIds}
            />

            {participants.length > 0 && (
              <div className="flex flex-col gap-y-4">
                <p className="text-primary text-sm font-semibold">
                  Integrantes del{" "}
                  {type === ACTION_TYPE.CREATE_EXPENSE ? "gasto" : "grupo"}
                </p>

                <div className="flex flex-wrap gap-2">
                  {participants.map((member, i) => (
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
            <AmountInput
              label="Monto"
              value={amount}
              onChange={setAmount}
              error={fieldErrors.amount}
            />
          )}

          {type === ACTION_TYPE.CREATE_GROUP && (
            <GroupTypeSelector
              value={groupType}
              onChange={setGroupType}
              error={fieldErrors.groupType}
            />
          )}

          <Button type="submit" loading={isLoading} fullWidth>
            Crear
          </Button>

          <FormErrorMessage message={responseError} className="-mt-8" />
        </form>
      )}
    </Modal>
  );
};

export default ActionModal;
