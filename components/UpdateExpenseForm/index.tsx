import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

import Image from "next/image";

import type { Session } from "next-auth";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { isEqual } from "date-fns";
import { X } from "lucide-react";

import useUpdateExpense from "@/hooks/data/expense/useUpdateExpense";

import type {
  Expense,
  ExpenseUpdateFieldErrors,
  ResponseMessage,
  ServerErrorResponse,
  UpdateExpenseFields,
  User,
} from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";
import { getParticipantIds } from "@/lib/utils";
import { updateExpenseSchema } from "@/lib/validations/schemas";

import { getParticipantOptions } from "../ActionModal";
import AmountInput from "../AmountInput";
import Badge from "../Badge";
import Button from "../Button";
import Collapse from "../Collapse";
import DatePicker from "../DatePicker";
import ExpenseTypeSelect from "../ExpenseTypeSelect";
import { EXPENSE_TYPE } from "../ExpenseTypeSelect/constants";
import FormErrorMessage from "../FormErrorMessage";
import GroupPicker from "../GroupPicker";
import Input from "../Input";
import InputErrorMessage from "../InputErrorMessage";
import MessageCard from "../MessageCard";
import Modal from "../Modal";
import Select from "../Select";
import Tooltip from "../Tooltip";
import UserSearchEngine from "../UserSearchEngine";

const modalTitles = {
  name: "Modificar nombre",
  type: "Modificar categoría",
  amount: "Modificar monto",
  paidById: "Modificar quién pagó",
  paymentDate: "Modificar fecha de pago",
  paymentData: "Modificar datos del pago",
  participantsToAdd: "Agregar participante/s",
  participantToRemove: "Eliminar participante",
  groupId: "Asignar gasto a un grupo",
  default: "Modificar datos del gasto",
  participantPayment: "Liquidar deuda",
};

const buttonLabels = {
  name: "Aplicar cambios",
  type: "Aplicar cambios",
  amount: "Aplicar cambios",
  paidById: "Aplicar cambios",
  paymentDate: "Aplicar cambios",
  paymentData: "Aplicar cambios",
  participantsToAdd: "Agregar participante/s",
  participantToRemove: "Eliminar participante",
  groupId: "Agregar a grupo",
  default: "Aplicar cambios",
  participantPayment: "Agregar pago",
};

export type UpdateExpenseFieldKeys = (keyof UpdateExpenseFields)[];

interface UpdateExpenseFormProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  expense: Expense;
  user: Session["user"];
  fieldsToUpdate: UpdateExpenseFieldKeys;
  selectedParticipant?: User | null;
  amountToBeSettled?: number | null;
}

const UpdateExpenseForm = ({
  isOpen,
  setIsOpen,
  expense,
  user,
  fieldsToUpdate,
  selectedParticipant,
  amountToBeSettled,
}: UpdateExpenseFormProps) => {
  const { mutate: updateExpense, isPending } = useUpdateExpense(expense.id);
  const queryClient = useQueryClient();

  const [newParticipants, setNewParticipants] = useState<User[]>([]);
  const [message, setMessage] = useState<ResponseMessage | null>(null);
  const [isSendeable, setIsSendeable] = useState(false);

  const editName = fieldsToUpdate.includes("name");
  const editType = fieldsToUpdate.includes("type");
  const addParticipants = fieldsToUpdate.includes("participantsToAdd");
  const removeParticipant =
    fieldsToUpdate.includes("participantToRemove") && selectedParticipant;
  const editPaidById = fieldsToUpdate.includes("paidById");
  const editPaymentDate = fieldsToUpdate.includes("paymentDate");
  const editPaymentData =
    fieldsToUpdate[0] === "paidById" && fieldsToUpdate[1] === "paymentDate";
  const editGroupId = fieldsToUpdate.includes("groupId");
  const editAmount = fieldsToUpdate.includes("amount");
  const addParticipantPayment =
    fieldsToUpdate.includes("participantPayment") &&
    selectedParticipant &&
    amountToBeSettled;

  const newParticipantIds = newParticipants.map((p) => p.id);

  const handleSelectNewParticipants = (
    newParticipant: User,
    handleChange: (e: string[]) => void,
  ) => {
    if (newParticipantIds.includes(newParticipant.id)) return;

    const newParticipantsArray = [...newParticipants, newParticipant];
    const newParticipantIdsArray = newParticipantsArray.map((p) => p.id);

    handleChange(newParticipantIdsArray);
    setNewParticipants(newParticipantsArray);
  };

  const handleRemoveNewParticipant = (participantId: string) => {
    const newParticipantsArray = newParticipants.filter(
      (p) => p.id !== participantId,
    );

    setNewParticipants(newParticipantsArray);
  };

  const form = useForm<
    UpdateExpenseFields,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    () => ServerErrorResponse<ExpenseUpdateFieldErrors>["error"]["message"],
    undefined
  >({
    defaultValues: {
      ...(editName && { name: expense.name }),
      ...(editType && { type: expense.type as EXPENSE_TYPE }),
      ...(addParticipants && { participantsToAdd: [] }),
      ...(removeParticipant && { participantToRemove: selectedParticipant.id }),
      ...(editPaidById && { paidById: expense.paidById }),
      ...(editPaymentDate && {
        paymentDate:
          typeof expense.paymentDate === "string"
            ? new Date(expense.paymentDate)
            : expense.paymentDate,
      }),
      ...(editAmount && { amount: expense.amount }),
      ...(addParticipantPayment && {
        participantPayment: {
          userId: selectedParticipant.id,
          amount: amountToBeSettled,
        },
      }),
    },
    onSubmit: async ({ value }) => {
      const { paidById, paymentDate, ...restFields } = value;

      const body = {
        ...restFields,
        ...(paidById !== expense.paidById && { paidById }),
        ...(paymentDate &&
          !isEqual(paymentDate!, expense.paymentDate) && { paymentDate }),
      };

      updateExpense(body, {
        onSuccess: (res) => {
          queryClient.invalidateQueries({
            queryKey: ["expense", expense.id],
          });

          res?.message && setMessage(res.message);
        },
        onError: (res) => {
          const {
            error: { message, fields },
          } = res.response.data;

          form.setErrorMap({
            onSubmit: {
              fields: fields as Partial<
                Record<keyof ExpenseUpdateFieldErrors, unknown>
              >,
            },
            onServer: message,
          });
        },
      });
    },
  });

  const toggleIsSendeable = useCallback(
    (currentValue: unknown, initialValue: unknown, isValid: boolean) => {
      if (isValid === false) {
        setIsSendeable(false);
      }

      if (currentValue !== initialValue && !isSendeable && isValid) {
        setIsSendeable(true);
      } else if (currentValue === initialValue && isSendeable) {
        setIsSendeable(false);
      }
    },
    [isSendeable],
  );

  useEffect(() => {
    if (addParticipants) {
      toggleIsSendeable(newParticipantIds.length, 0, true);
    }

    if (removeParticipant) {
      setIsSendeable(true);
    }

    if (addParticipantPayment) {
      setIsSendeable(true);
    }
  }, [
    newParticipantIds,
    addParticipants,
    removeParticipant,
    addParticipantPayment,
    toggleIsSendeable,
    form.state.isFormValid,
  ]);

  if (!fieldsToUpdate) return null;

  const handleClose = () => {
    setIsOpen(false);
    setNewParticipants([]);
    setMessage(null);
    setIsSendeable(false);
    form.reset();
  };

  const participants = expense.participants.map(
    (participant) => participant.user,
  );
  const participantIds = getParticipantIds(expense.participants);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        fieldsToUpdate.length > 1
          ? editPaymentData
            ? modalTitles.paymentData
            : modalTitles.default
          : modalTitles[fieldsToUpdate[0]]
      }
      showHeader={!message}
      unstyled={!!message}
      className="!gap-y-4 lg:!gap-y-8"
    >
      <>
        {message ? (
          <MessageCard
            {...message}
            icon={ICON_MAP[message?.icon]}
            countdown={{
              color: message.color,
              start: 3,
              onComplete: () => handleClose(),
            }}
          >
            {message.content}
          </MessageCard>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="flex flex-col gap-y-1"
          >
            {editName && (
              <form.Field
                name="name"
                validators={{
                  onChange: updateExpenseSchema.shape.name,
                  onBlur: updateExpenseSchema.shape.name,
                }}
              >
                {(field) => (
                  <Input
                    id="name"
                    label="Nombre del gasto"
                    placeholder="Nombre del gasto"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);

                      toggleIsSendeable(
                        e.target.value,
                        expense.name,
                        field.state.meta.isValid,
                      );
                    }}
                    onBlur={field.handleBlur}
                    autoComplete="name"
                    required
                    error={
                      field.state.meta.errors[0]?.message ||
                      field.state.meta.errorMap.onSubmit
                    }
                  />
                )}
              </form.Field>
            )}

            {editType && (
              <form.Field
                name="type"
                validators={{
                  onChange: updateExpenseSchema.shape.type,
                }}
              >
                {(field) => (
                  <ExpenseTypeSelect
                    label="Tipo de gasto:"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e);

                      toggleIsSendeable(
                        e,
                        expense.type,
                        field.state.meta.isValid,
                      );
                    }}
                    error={
                      field.state.meta.errors[0]?.message ||
                      field.state.meta.errorMap.onSubmit
                    }
                  />
                )}
              </form.Field>
            )}

            {addParticipants && (
              <form.Field
                name="participantsToAdd"
                validators={{
                  onChange: updateExpenseSchema.shape.participantsToAdd,
                  onBlur: updateExpenseSchema.shape.participantsToAdd,
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-y-8">
                    <UserSearchEngine
                      user={user}
                      onSelect={(p) =>
                        handleSelectNewParticipants(p, field.handleChange)
                      }
                      excludeUserIds={[...participantIds, ...newParticipantIds]}
                      onBlur={field.handleBlur}
                    />

                    <Collapse
                      isOpen={newParticipantIds.length > 0}
                      contentClassName={clsx(
                        "relative transition-[padding] duration-300",
                        newParticipantIds.length > 0 ? "pt-7" : "pt-0",
                      )}
                    >
                      <label
                        className={clsx(
                          "absolute left-0 transform font-semibold transition-all duration-300",
                          !!field.state.value
                            ? "translate-x-1 -translate-y-6 text-sm"
                            : "text-md translate-x-3 translate-y-2.5 text-lg",
                          field.state.value &&
                            field.state.value.length > 1 &&
                            "text-primary",
                        )}
                      >
                        Nuevos participantes
                      </label>

                      <div className="flex max-h-50 flex-wrap gap-2 overflow-y-scroll pt-3">
                        {newParticipants.map((p) => (
                          <Tooltip key={p.id} color="info" content={p.name}>
                            <Badge
                              color="info"
                              leftItem={
                                p.image && (
                                  <Image
                                    alt="User avatar"
                                    src={p.image}
                                    height={14}
                                    width={14}
                                    className="-ml-1.5 h-3.5 w-3.5 flex-shrink-0 rounded-full"
                                  />
                                )
                              }
                              rightItem={
                                participantIds.length > 1 && (
                                  <Button
                                    aria-label="Remove selected user"
                                    type="button"
                                    onClick={() =>
                                      handleRemoveNewParticipant(p.id)
                                    }
                                    unstyled
                                    className="hover:text-background/90 text-background cursor-pointer rounded-full transition-colors duration-300"
                                  >
                                    <X className="-mr-1 h-3.5 w-3.5 stroke-3" />
                                  </Button>
                                )
                              }
                            >
                              {p.id === user.id ? "Tu" : p.name}
                            </Badge>
                          </Tooltip>
                        ))}
                      </div>
                    </Collapse>
                  </div>
                )}
              </form.Field>
            )}

            {removeParticipant && (
              <p>
                ¿Estas seguro que deseas eliminar a{" "}
                <span className="text-semibold">
                  {selectedParticipant.name}
                </span>{" "}
                del gasto?
              </p>
            )}

            {editPaidById && (
              <form.Field
                name="paidById"
                validators={{
                  onChange: updateExpenseSchema.shape.paidById,
                }}
              >
                {(field) => (
                  <div className="col-span-1 flex flex-col">
                    <Select
                      options={getParticipantOptions(participants)}
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e);

                        toggleIsSendeable(
                          e,
                          expense.paidById,
                          field.state.meta.isValid,
                        );
                      }}
                      label="Pagado por:"
                      placeholder="Selecciona un participante"
                    />

                    <InputErrorMessage
                      message={
                        field.state.meta.errors[0]?.message ||
                        field.state.meta.errorMap.onSubmit
                      }
                    />
                  </div>
                )}
              </form.Field>
            )}

            {editPaymentDate && (
              <form.Field
                name="paymentDate"
                validators={{
                  onChange: updateExpenseSchema.shape.paymentDate,
                }}
              >
                {(field) => (
                  <DatePicker
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e);

                      toggleIsSendeable(
                        e.toISOString(),
                        expense.paymentDate,
                        field.state.meta.isValid,
                      );
                    }}
                    error={
                      field.state.meta.errors[0]?.message ||
                      field.state.meta.errorMap.onSubmit
                    }
                  />
                )}
              </form.Field>
            )}

            {editGroupId && (
              <form.Field
                name="groupId"
                validators={{
                  onChange: updateExpenseSchema.shape.groupId,
                  onBlur: updateExpenseSchema.shape.groupId,
                }}
              >
                {(field) => (
                  <GroupPicker
                    version="v2"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e);

                      toggleIsSendeable(e, "", field.state.meta.isValid);
                    }}
                    pickedParticipants={participants}
                    onBlur={field.handleBlur}
                    error={
                      field.state.meta.errors[0]?.message ||
                      field.state.meta.errorMap.onSubmit
                    }
                  />
                )}
              </form.Field>
            )}

            {editAmount && (
              <form.Field
                name="amount"
                validators={{
                  onChange: updateExpenseSchema.shape.amount,
                  onBlur: updateExpenseSchema.shape.amount,
                }}
              >
                {(field) => (
                  <AmountInput
                    label="Monto"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e);

                      toggleIsSendeable(
                        e,
                        Number.isInteger(expense.amount)
                          ? Number(expense.amount.toFixed(2))
                          : expense.amount,
                        field.state.meta.isValid,
                      );
                    }}
                    onBlur={field.handleBlur}
                    error={
                      field.state.meta.errors[0]?.message ||
                      field.state.meta.errorMap.onSubmit
                    }
                  />
                )}
              </form.Field>
            )}

            {addParticipantPayment && (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <p>
                    Se marcará como{" "}
                    <span className="font-semibold">pagado</span> el total del
                    monto adeudado.
                  </p>

                  <p className="text-foreground/75 text-sm">
                    El monto no es editable y esta acción no se puede deshacer.
                  </p>
                </div>

                <form.Field
                  name="participantPayment"
                  validators={{
                    onChange: updateExpenseSchema.shape.participantPayment,
                    onBlur: updateExpenseSchema.shape.participantPayment,
                  }}
                >
                  {(field) => (
                    <AmountInput
                      label="Total a liquidar"
                      value={field.state.value?.amount}
                      onChange={(value) =>
                        field.handleChange((e) => e && { ...e, amount: value })
                      }
                      onBlur={field.handleBlur}
                      error={
                        field.state.meta.errors[0]?.message ||
                        field.state.meta.errorMap.onSubmit
                      }
                      disabled
                    />
                  )}
                </form.Field>
              </div>
            )}

            <Button
              type="submit"
              className="mt-4 lg:mt-7"
              loading={isPending}
              disabled={!isSendeable}
              fullWidth
            >
              {fieldsToUpdate.length > 1
                ? editPaymentData
                  ? buttonLabels.paymentData
                  : buttonLabels.default
                : buttonLabels[fieldsToUpdate[0]]}
            </Button>

            <form.Subscribe selector={(state) => [state.errorMap]}>
              {([errorMap]) => {
                return <FormErrorMessage message={errorMap.onServer} />;
              }}
            </form.Subscribe>
          </form>
        )}
      </>
    </Modal>
  );
};

export default UpdateExpenseForm;
