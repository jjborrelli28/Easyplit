import { useState } from "react";

import type { Session } from "next-auth";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";

import useCreateExpense from "@/hooks/data/expense/useCreateExpense";
import useResolveDraftUsers from "@/hooks/data/users/useResolveDraftUsers";
import useSnackbar from "@/hooks/useSnackbar";

import type {
  CreateExpenseFields,
  ExpenseCreationFieldErrors,
  Group,
  ServerErrorResponse,
  User,
} from "@/lib/api/types";
import { today } from "@/lib/utils";
import { createExpenseSchema } from "@/lib/validations/schemas";

import AmountInput from "@/components/AmountInput";
import Button from "@/components/Button";
import DatePicker from "@/components/DatePicker";
import ExpenseTypeSelect from "@/components/ExpenseTypeSelect";
import { EXPENSE_TYPE } from "@/components/ExpenseTypeSelect/constants";
import FormErrorMessage from "@/components/FormErrorMessage";
import GroupPicker from "@/components/GroupPicker";
import Input from "@/components/Input";
import InputErrorMessage from "@/components/InputErrorMessage";
import Select from "@/components/Select";
import UserPicker from "@/components/UserPicker";
import { getParticipantOptions } from "..";

interface ExpenseFromProps {
  user: Session["user"];
  onClose: VoidFunction;
  // When creating an expense from within a group, it should start out
  // linked to that group with every current member pre-selected — the user
  // can still remove whoever shouldn't be in this particular expense.
  group?: Group;
}

const ExpenseForm = ({ user, onClose, group }: ExpenseFromProps) => {
  const { mutate: createExpense, isPending } = useCreateExpense();
  const resolveDraftUsers = useResolveDraftUsers();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const initialParticipants = group
    ? [
        user as User,
        ...group.members
          .map((member) => member.user)
          .filter((member) => member.id !== user.id),
      ]
    : [user as User];

  const [participants, setParticipants] = useState<User[]>(initialParticipants);
  const [isResolvingParticipants, setIsResolvingParticipants] = useState(false);

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
      type: EXPENSE_TYPE.UNCATEGORIZED,
      amount: 0,
      participantIds: initialParticipants.map((participant) => participant.id!),
      paidById: user.id!,
      paymentDate: today,
      groupId: group?.id,
    },
    onSubmit: async ({ value }) => {
      setIsResolvingParticipants(true);

      let participantIds = value.participantIds;
      let paidById = value.paidById;

      try {
        const { resolvedUsers, idMap } = await resolveDraftUsers(
          participants,
          value.name,
        );

        participantIds = resolvedUsers.map((p) => p.id);
        paidById = idMap.get(paidById) ?? paidById;
      } catch {
        setIsResolvingParticipants(false);

        form.setErrorMap({
          onServer: [
            "No se pudieron agregar todos los participantes. Intentá de nuevo.",
          ],
        });

        return;
      }

      setIsResolvingParticipants(false);

      createExpense(
        { ...value, participantIds, paidById },
        {
          onSuccess: (res) => {
            queryClient.invalidateQueries({
              queryKey: ["my-expenses-and-groups", user.id!],
            });

            if (group) {
              queryClient.invalidateQueries({
                queryKey: ["group", group.id],
              });
            }

            if (res?.message) {
              showSnackbar(res.message.title as string, {
                color: res.message.color,
              });
            }

            handleCloseModal();
          },
          onError: (res) => {
            const {
              error: { message, fields },
            } = res.response.data;

            form.setErrorMap({
              onSubmit: {
                fields: fields as Partial<
                  Record<keyof ExpenseCreationFieldErrors, unknown>
                >,
              },
              onServer: message,
            });
          },
        },
      );
    },
  });

  const handleCloseModal = () => {
    onClose();
    form.reset();
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="grid grid-cols-1 gap-y-1 lg:grid-cols-2 lg:gap-x-8"
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
              containerClassName="col-span-1"
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
              containerClassName="col-span-1"
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
              initialUsers={initialParticipants}
              onBlur={field.handleBlur}
              excludeUserIds={field.state.value}
              modalTitle="Buscar participantes"
              modalListTitle="Participantes"
              allowVirtualUsers
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
            onChange: createExpenseSchema.shape.paidById,
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

        <form.Field
          name="paymentDate"
          validators={{
            onChange: createExpenseSchema.shape.paymentDate,
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

        {!group && (
          <form.Field
            name="groupId"
            validators={{
              onChange: createExpenseSchema.shape.groupId,
              onBlur: createExpenseSchema.shape.groupId,
            }}
          >
            {(field) => (
              <GroupPicker
                value={field.state.value}
                onChange={field.handleChange}
                pickedParticipants={participants}
                onBlur={field.handleBlur}
                error={
                  field.state.meta.errors[0]?.message ||
                  field.state.meta.errorMap.onSubmit
                }
                containerClassName="col-span-1 lg:col-span-2"
              />
            )}
          </form.Field>
        )}

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
              containerClassName="col-span-1 mx-auto lg:col-span-2"
            />
          )}
        </form.Field>

        <Button
          type="submit"
          className="col-span-1 mt-4 lg:col-span-2 lg:mt-7"
          loading={isPending || isResolvingParticipants}
          fullWidth
        >
          Crear
        </Button>

        <form.Subscribe selector={(state) => [state.errorMap]}>
          {([errorMap]) => {
            return (
              <FormErrorMessage
                message={errorMap.onServer}
                className="col-span-1 lg:col-span-2"
              />
            );
          }}
        </form.Subscribe>
      </form>
    </>
  );
};

export default ExpenseForm;
