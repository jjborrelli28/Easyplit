import React, { Dispatch, SetStateAction, useState } from "react";
import Modal from "../Modal";
import {
  Expense,
  ExpenseUpdateFieldErrors,
  ResponseMessage,
  ServerErrorResponse,
  UpdateExpenseFields,
} from "@/lib/api/types";
import { useForm } from "@tanstack/react-form";
import useUpdateExpense from "@/hooks/data/expense/useUpdateExpense";
import MessageCard from "../MessageCard";
import ICON_MAP from "@/lib/icons";
import { updateExpenseSchema } from "@/lib/validations/schemas";
import Input from "../Input";
import ExpenseTypeSelect from "../ExpenseTypeSelect";
import UserPicker from "../UserPicker";
import Select from "../Select";
import { getParticipantOptions } from "../ActionModal";
import InputErrorMessage from "../InputErrorMessage";
import DatePicker from "../DatePicker";
import GroupPicker from "../GroupPicker";
import AmountInput from "../AmountInput";
import Button from "../Button";
import FormErrorMessage from "../FormErrorMessage";
import { Session } from "next-auth";
import { modalTitles } from "./constants";

export type UpdateExpenseFieldKeys = (keyof Omit<UpdateExpenseFields, "id">)[];

interface UpdateExpenseFormProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  expense: Expense;
  user: Session["user"];
  fieldsToUpdate: UpdateExpenseFieldKeys;
}

const UpdateExpenseForm = ({
  isOpen,
  setIsOpen,
  expense,
  user,
  fieldsToUpdate,
}: UpdateExpenseFormProps) => {
  const { mutate: updateExpense, isPending } = useUpdateExpense();

  const [message, setMessage] = useState<ResponseMessage | null>(null);

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
      id: expense.id,
      ...(fieldsToUpdate.includes("paymentDate") && {
        paymentDate: expense.paymentDate,
      }),
    },
    onSubmit: async ({ value }) => {
      updateExpense(value, {
        onSuccess: (res) => {
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

  if (!fieldsToUpdate) return null;

  const handleClose = () => {
    setIsOpen(false);
    setMessage(null);
    form.reset();
  };

  const participants = expense.participants.map(
    (participant) => participant.user,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        fieldsToUpdate.length > 1
          ? "Editar gasto"
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
            {/* <form.Field
              name="name"
              validators={{
                onBlur: updateExpenseSchema.shape.name,
              }}
            >
              {(field) => (
                <Input
                  id="name"
                  label="Nombre del gasto"
                  placeholder="Nombre del gasto"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  autoComplete="name"
                  required
                  error={
                    field.state.meta.errors[0]?.message ||
                    field.state.meta.errorMap.onSubmit
                  }
                  containerClassName="col-span-1"
                />
              )}
            </form.Field>

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
                  onChange={(e) => field.handleChange(e)}
                  error={
                    field.state.meta.errors[0]?.message ||
                    field.state.meta.errorMap.onSubmit
                  }
                  containerClassName="col-span-1"
                />
              )}
            </form.Field>

            <form.Field
              name="participantIds"
              validators={{
                onChange: updateExpenseSchema.shape.participantIds,
                onBlur: updateExpenseSchema.shape.participantIds,
              }}
            >
              {(field) => (
                <UserPicker
                  label="Participantes del gasto"
                  user={user}
                  value={field.state.value}
                  onChange={field.handleChange}
                  onUserListChange={(e) => setParticipants(e)}
                  onBlur={field.handleBlur}
                  excludeUserIds={field.state.value}
                  modalTitle="Buscar participantes"
                  modalListTitle="Participantes"
                  error={
                    field.state.meta.errors[0]?.message ||
                    field.state.meta.errorMap.onSubmit
                  }
                  containerClassName="col-span-1 lg:col-span-2"
                />
              )}
            </form.Field>

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
                    onChange={field.handleChange}
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
*/}

            <form.Field
              name="paymentDate"
              validators={{
                onChange: updateExpenseSchema.shape.paymentDate,
              }}
            >
              {(field) => (
                <DatePicker
                  value={field.state.value}
                  onChange={field.handleChange}
                  error={
                    field.state.meta.errors[0]?.message ||
                    field.state.meta.errorMap.onSubmit
                  }
                  containerClassName="col-span-1"
                />
              )}
            </form.Field>

            {fieldsToUpdate.includes("groupId") && (
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
                    user={user}
                    value={field.state.value}
                    onChange={field.handleChange}
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

            {/* <form.Field
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
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  error={
                    field.state.meta.errors[0]?.message ||
                    field.state.meta.errorMap.onSubmit
                  }
                  containerClassName="col-span-1 mx-auto lg:col-span-2"
                />
              )}
            </form.Field> */}

            <Button
              type="submit"
              className="mt-4 lg:mt-7"
              loading={isPending}
              fullWidth
            >
              Actualizar
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
