import { type Dispatch, type SetStateAction, useState } from "react";

import { useForm } from "@tanstack/react-form";

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
import { updateExpenseSchema } from "@/lib/validations/schemas";
import type { Session } from "next-auth";

import { getParticipantOptions } from "../ActionModal";
import AmountInput from "../AmountInput";
import Button from "../Button";
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
import { modalTitles } from "./constants";

export type UpdateExpenseFieldKeys = (keyof Omit<
  UpdateExpenseFields,
  "id" | "participantIds"
>)[];

interface UpdateExpenseFormProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  expense: Expense;
  user: Session["user"];
  fieldsToUpdate: UpdateExpenseFieldKeys;
  participantToRemove?: User;
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

  const editName = fieldsToUpdate.includes("name");
  const editType = fieldsToUpdate.includes("type");
  const editPaidById = fieldsToUpdate.includes("paidById");
  const editPaymentDate = fieldsToUpdate.includes("paymentDate");
  const editGroupId = fieldsToUpdate.includes("groupId");
  const editAmount = fieldsToUpdate.includes("amount");

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
      ...(editName && { name: expense.name }),
      ...(editType && { type: expense.type as EXPENSE_TYPE }),
      ...(editPaidById && { paidById: expense.paidById }),
      ...(editPaymentDate && {
        paymentDate:
          typeof expense.paymentDate === "string"
            ? new Date(expense.paymentDate)
            : expense.paymentDate,
      }),
      ...(editAmount && { amount: expense.amount }),
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
            {editName && (
              <form.Field
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
                    onChange={(e) => field.handleChange(e)}
                    error={
                      field.state.meta.errors[0]?.message ||
                      field.state.meta.errorMap.onSubmit
                    }
                    containerClassName="col-span-1"
                  />
                )}
              </form.Field>
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
                    onChange={field.handleChange}
                    error={
                      field.state.meta.errors[0]?.message ||
                      field.state.meta.errorMap.onSubmit
                    }
                    containerClassName="col-span-1"
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
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    error={
                      field.state.meta.errors[0]?.message ||
                      field.state.meta.errorMap.onSubmit
                    }
                    containerClassName="col-span-1 mx-auto lg:col-span-2"
                  />
                )}
              </form.Field>
            )}

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
