import { useState } from "react";

import type { Session } from "next-auth";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";

import useCreateGroup from "@/hooks/data/group/useCreateGroup";

import type {
  CreateGroupFields,
  GroupCreationFieldErrors,
  ResponseMessage,
  ServerErrorResponse,
} from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";
import { createGroupSchema } from "@/lib/validations/schemas";

import Button from "@/components/Button";
import FormErrorMessage from "@/components/FormErrorMessage";
import GroupTypeSelect from "@/components/GroupTypeSelect";
import { GROUP_TYPE } from "@/components/GroupTypeSelect/constants";
import Input from "@/components/Input";
import MessageCard from "@/components/MessageCard";
import UserPicker from "@/components/UserPicker";

interface ExpenseFromProps {
  user: Session["user"];
  onClose: VoidFunction;
  handleShowModalHeader: (state: boolean) => void;
}

const GroupForm = ({
  user,
  onClose,
  handleShowModalHeader,
}: ExpenseFromProps) => {
  const queryClient = useQueryClient();
  const { mutate: createGroup, isPending } = useCreateGroup();

  const [message, setMessage] = useState<ResponseMessage | null>(null);

  const form = useForm<
    CreateGroupFields,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    () => ServerErrorResponse<GroupCreationFieldErrors>["error"]["message"],
    undefined
  >({
    defaultValues: {
      name: "",
      type: GROUP_TYPE.OTHER,
      memberIds: [user.id!],
      createdById: user.id!,
    },
    onSubmit: async ({ value }) => {
      createGroup(value, {
        onSuccess: (res) => {
          handleShowModalHeader(false);

          res?.message && setMessage(res.message);
          queryClient.invalidateQueries({
            predicate: (query) =>
              query.queryKey[0] === "my-groups-and-expenses" &&
              query.queryKey[1] === user.id!,
          });
        },
        onError: (res) => {
          const {
            error: { message, fields },
          } = res.response.data;

          form.setErrorMap({
            onSubmit: {
              fields: fields as Partial<
                Record<keyof GroupCreationFieldErrors, unknown>
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
          className="grid grid-cols-1 gap-y-1 lg:gap-x-8"
        >
          <form.Field
            name="name"
            validators={{
              onBlur: createGroupSchema.shape.name,
            }}
          >
            {(field) => (
              <Input
                id="name"
                label="Nombre del grupo"
                placeholder="Nombre del grupo"
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
              onChange: createGroupSchema.shape.type,
            }}
          >
            {(field) => (
              <GroupTypeSelect
                label="Tipo de grupo:"
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
            name="memberIds"
            validators={{
              onChange: createGroupSchema.shape.memberIds,
              onBlur: createGroupSchema.shape.memberIds,
            }}
          >
            {(field) => (
              <UserPicker
                label="Miembros del grupo"
                user={user}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                excludeUserIds={field.state.value}
                modalTitle="Buscar miembros"
                modalListTitle="Miembros"
                error={
                  field.state.meta.errors[0]?.message ||
                  field.state.meta.errorMap.onSubmit
                }
              />
            )}
          </form.Field>

          <Button
            type="submit"
            className="mt-4 lg:mt-7"
            loading={isPending}
            fullWidth
          >
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

export default GroupForm;
