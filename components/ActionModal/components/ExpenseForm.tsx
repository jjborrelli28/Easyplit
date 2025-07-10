import { useState } from "react";

import type { Session } from "next-auth";

import { useForm } from "@tanstack/react-form";

import useCreateExpense from "@/hooks/expense/useCreateExpense";

import type {
  CreateExpenseFields,
  ExpenseCreationFieldErrors,
  ResponseMessage,
  ServerErrorResponse,
  User,
} from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";
import { createExpenseSchema } from "@/lib/validations/schemas";

import AmountInput from "@/components/AmountInput";
import Button from "@/components/Button";
import ExpenseTypeSelect from "@/components/ExpenseTypeSelect";
import FormErrorMessage from "@/components/FormErrorMessage";
import GroupPicker from "@/components/GroupPicker";
import Input from "@/components/Input";
import InputErrorMessage from "@/components/InputErrorMessage";
import MessageCard from "@/components/MessageCard";
import Select from "@/components/Select";
import UserPicker from "@/components/UserPicker";
import { getParticipantOptions } from "..";

interface ExpenseFromProps {
  user: Session["user"];
  onClose: VoidFunction;
  handleShowModalHeader: (state: boolean) => void;
}

const ExpenseForm = ({
  user,
  onClose,
  handleShowModalHeader,
}: ExpenseFromProps) => {
  const { mutate: createExpense, isPending } = useCreateExpense();

  const [participants, setParticipants] = useState<User[]>([user as User]);
  const [message, setMessage] = useState<ResponseMessage | null>(null);

  const form = useForm<
    CreateExpenseFields,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    () => ServerErrorResponse<ExpenseCreationFieldErrors>["error"]["message"],
    undefined
  >({
    defaultValues: {
      name: "",
      paidById: user.id!,
      amount: 0,
      participantIds: [user.id!],
      participants: [user],
      groupId: undefined,
    },
    onSubmit: async ({ value }) => {
      createExpense(value, {
        onSuccess: (res) => {
          handleShowModalHeader(false);

          res?.message && setMessage(res.message);
        },
        onError: (res) => {
          const {
            error: { message, fields },
          } = res.response.data;

          form.setErrorMap({
            onSubmit: {
              fields: fields as Partial<
                Record<keyof CreateExpenseFields, unknown>
              >,
            },
            onServer: message,
          });
        },
      });
    },
  });

  const handleCloseModal = () => {
    onClose();
    handleShowModalHeader(true);

    form.reset();
  };

  return (
    <>
      {message ? (
        <MessageCard
          {...message}
          icon={ICON_MAP[message?.icon]}
          countdown={{
            color: message.color,
            start: 3,
            onComplete: () => handleCloseModal(),
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
          <form.Field
            name="name"
            validators={{
              onBlur: createExpenseSchema.shape.name,
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
              />
            )}
          </form.Field>

          <form.Field
            name="type"
            validators={{
              onChange: createExpenseSchema.shape.type,
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
              />
            )}
          </form.Field>

          <form.Field
            name="participantIds"
            validators={{
              onChange: createExpenseSchema.shape.participantIds,
              onBlur: createExpenseSchema.shape.participantIds,
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
              />
            )}
          </form.Field>

          <form.Field
            name="paidById"
            validators={{
              onChange: createExpenseSchema.shape.paidById,
            }}
          >
            {(field) => (
              <div className="flex flex-col">
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

          <form.Field
            name="groupId"
            validators={{
              onChange: createExpenseSchema.shape.groupId,
              onBlur: createExpenseSchema.shape.groupId,
            }}
          >
            {(field) => (
              <GroupPicker
                user={user}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                error={
                  field.state.meta.errors[0]?.message ||
                  field.state.meta.errorMap.onSubmit
                }
              />
            )}
          </form.Field>

          <form.Field
            name="amount"
            validators={{
              onChange: createExpenseSchema.shape.amount,
              onBlur: createExpenseSchema.shape.amount,
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
              />
            )}
          </form.Field>

          <Button type="submit" className="mt-4" loading={isPending} fullWidth>
            Crear
          </Button>

          <form.Subscribe selector={(state) => [state.errorMap]}>
            {([errorMap]) => {
              return <FormErrorMessage message={errorMap.onServer} />;
            }}
          </form.Subscribe>
        </form>
      )}
    </>
  );
};

export default ExpenseForm;
