import { useState } from "react";

import type { Session } from "next-auth";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";

import useCreateGroup from "@/hooks/data/group/useCreateGroup";
import useResolveDraftUsers from "@/hooks/data/users/useResolveDraftUsers";
import useSnackbar from "@/hooks/useSnackbar";

import type {
  CreateGroupFields,
  GroupCreationFieldErrors,
  ServerErrorResponse,
  User,
} from "@/lib/api/types";
import { createGroupSchema } from "@/lib/validations/schemas";

import Button from "@/components/Button";
import FormErrorMessage from "@/components/FormErrorMessage";
import GroupTypeSelect from "@/components/GroupTypeSelect";
import { GROUP_TYPE } from "@/components/GroupTypeSelect/constants";
import Input from "@/components/Input";
import UserPicker from "@/components/UserPicker";

interface ExpenseFromProps {
  user: Session["user"];
  onClose: VoidFunction;
}

const GroupForm = ({ user, onClose }: ExpenseFromProps) => {
  const { mutate: createGroup, isPending } = useCreateGroup();
  const resolveDraftUsers = useResolveDraftUsers();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const [members, setMembers] = useState<User[]>([user as User]);
  const [isResolvingMembers, setIsResolvingMembers] = useState(false);

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
    },
    onSubmit: async ({ value }) => {
      setIsResolvingMembers(true);

      let memberIds = value.memberIds;

      try {
        const { resolvedUsers } = await resolveDraftUsers(members, value.name);

        memberIds = resolvedUsers.map((m) => m.id);
      } catch {
        setIsResolvingMembers(false);

        form.setErrorMap({
          onServer: [
            "No se pudieron agregar todos los miembros. Intentá de nuevo.",
          ],
        });

        return;
      }

      setIsResolvingMembers(false);

      createGroup(
        { ...value, memberIds },
        {
          onSuccess: (res) => {
            queryClient.invalidateQueries({
              queryKey: ["my-expenses-and-groups", user.id!],
            });

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
                  Record<keyof GroupCreationFieldErrors, unknown>
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
              onUserListChange={setMembers}
              onBlur={field.handleBlur}
              excludeUserIds={field.state.value}
              modalTitle="Buscar miembros"
              modalListTitle="Miembros"
              allowVirtualUsers
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
          loading={isPending || isResolvingMembers}
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
    </>
  );
};

export default GroupForm;
