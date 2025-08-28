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
import { X } from "lucide-react";

import useUpdateGroup from "@/hooks/data/group/useUpdateGroup";

import type {
  Expense,
  Group,
  GroupUpdateFieldErrors,
  ResponseMessage,
  ServerErrorResponse,
  UpdateGroupFields,
  User,
} from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";
import { getParticipantIds } from "@/lib/utils";
import { updateGroupSchema } from "@/lib/validations/schemas";

import Badge from "../Badge";
import Button from "../Button";
import Collapse from "../Collapse";
import FormErrorMessage from "../FormErrorMessage";
import GroupTypeSelect from "../GroupTypeSelect";
import { GROUP_TYPE } from "../GroupTypeSelect/constants";
import Input from "../Input";
import MessageCard from "../MessageCard";
import Modal from "../Modal";
import Tooltip from "../Tooltip";
import UserSearchEngine from "../UserSearchEngine";

const modalTitles = {
  name: "Modificar nombre del grupo",
  type: "Modificar tipo de grupo",
  membersToAdd: "Agregar miembro/s",
  memberToRemove: "Eliminar miembro",
  expensesToAdd: "Agregar gasto/s",
  expenseToRemove: "Eliminar gasto",
  default: "Modificar datos del grupo",
};

const buttonLabels = {
  name: "Aplicar cambios",
  type: "Aplicar cambios",
  membersToAdd: "Agregar miembro/s",
  memberToRemove: "Eliminar miembro",
  expensesToAdd: "Agregar gasto/s",
  expenseToRemove: "Eliminar gasto",
  default: "Aplicar cambios",
};

export type UpdateGroupFieldKeys = (keyof UpdateGroupFields)[];

interface UpdateGroupFormProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  group: Group;
  user: Session["user"];
  fieldsToUpdate: UpdateGroupFieldKeys;
  memberToRemove?: User;
  selectedMember?: User | null;
  selectedExpense?: Expense;
}

const UpdateGroupForm = ({
  isOpen,
  setIsOpen,
  group,
  user,
  fieldsToUpdate,
  selectedMember,
  selectedExpense,
}: UpdateGroupFormProps) => {
  const { mutate: updateGroup, isPending } = useUpdateGroup(group.id);
  const queryClient = useQueryClient();

  const [newMembers, setNewMembers] = useState<User[]>([]);
  const [newExpenses, setNewExpenses] = useState<Expense[]>([]);
  const [message, setMessage] = useState<ResponseMessage | null>(null);
  const [isSendeable, setIsSendeable] = useState(false);

  const editName = fieldsToUpdate.includes("name");
  const editType = fieldsToUpdate.includes("type");
  const addMembers = fieldsToUpdate.includes("membersToAdd");
  const removeMember =
    fieldsToUpdate.includes("memberToRemove") && selectedMember;
  const addExpenses = fieldsToUpdate.includes("expensesToAdd");
  const removeExpense =
    fieldsToUpdate.includes("expenseToRemove") && selectedExpense;

  const newMemberIds = newMembers.map((m) => m.id);
  const newExpenseIds = newExpenses.map((e) => e.id);

  const handleSelectNewMembers = (
    newMember: User,
    handleChange: (e: string[]) => void,
  ) => {
    if (newMemberIds.includes(newMember.id)) return;

    const newMembersArray = [...newMembers, newMember];
    const newMemberIdsArray = newMembersArray.map((p) => p.id);

    handleChange(newMemberIdsArray);
    setNewMembers(newMembersArray);
  };

  const handleRemoveNewMember = (memberId: string) => {
    const newMembersArray = newMembers.filter((p) => p.id !== memberId);

    setNewMembers(newMembersArray);
  };

  const handleSelectNewExpenses = (
    newExpense: Expense,
    handleChange: (e: string[]) => void,
  ) => {
    if (newExpenseIds.includes(newExpense.id)) return;

    const newExpensesArray = [...newExpenses, newExpense];
    const newExpenseIdsArray = newExpensesArray.map((p) => p.id);

    handleChange(newExpenseIdsArray);
    setNewExpenses(newExpensesArray);
  };

  const handleRemoveNewExpense = (expenseId: string) => {
    const newExpensesArray = newExpenses.filter((p) => p.id !== expenseId);

    setNewExpenses(newExpensesArray);
  };

  const form = useForm<
    UpdateGroupFields,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    () => ServerErrorResponse<GroupUpdateFieldErrors>["error"]["message"],
    undefined
  >({
    defaultValues: {
      ...(editName && { name: group.name }),
      ...(editType && { type: group.type as GROUP_TYPE }),
      ...(addMembers && { membersToAdd: [] }),
      ...(removeMember && { memberToRemove: selectedMember?.id }),
      ...(addExpenses && { expensesToAdd: [] }),
      ...(removeExpense && { expenseToRemove: selectedExpense?.id }),
    },
    onSubmit: async ({ value }) => {
      updateGroup(value, {
        onSuccess: (res) => {
          queryClient.invalidateQueries({
            queryKey: ["group", group.id],
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
                Record<keyof GroupUpdateFieldErrors, unknown>
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
    if (addMembers) {
      toggleIsSendeable(newMemberIds.length, 0, true);
    }

    if (removeMember) {
      setIsSendeable(true);
    }

    if (addExpenses) {
      toggleIsSendeable(newExpenseIds.length, 0, true);
    }

    if (removeExpense) {
      setIsSendeable(true);
    }
  }, [
    addMembers,
    newMemberIds,
    removeMember,
    addExpenses,
    newExpenseIds,
    removeExpense,
    form.state.isFormValid,
  ]);

  if (!fieldsToUpdate) return null;

  const handleClose = () => {
    setIsOpen(false);
    setNewMembers([]);
    setNewExpenses([]);
    setMessage(null);
    setIsSendeable(false);
    form.reset();
  };

  const members = group.members.map((member) => member.user);
  const memberIds = getParticipantIds(group.members);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        fieldsToUpdate.length > 1
          ? modalTitles.default
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
                  onChange: updateGroupSchema.shape.name,
                  onBlur: updateGroupSchema.shape.name,
                }}
              >
                {(field) => (
                  <Input
                    id="name"
                    label="Nombre del grupo"
                    placeholder="Nombre del grupo"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);

                      toggleIsSendeable(
                        e.target.value,
                        group.name,
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
                  onChange: updateGroupSchema.shape.type,
                }}
              >
                {(field) => (
                  <GroupTypeSelect
                    label="Tipo de grupo:"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e);

                      toggleIsSendeable(
                        e,
                        group.type,
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

            {addMembers && (
              <form.Field
                name="membersToAdd"
                validators={{
                  onChange: updateGroupSchema.shape.membersToAdd,
                  onBlur: updateGroupSchema.shape.membersToAdd,
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-y-8">
                    <UserSearchEngine
                      user={user}
                      onSelect={(p) =>
                        handleSelectNewMembers(p, field.handleChange)
                      }
                      excludeUserIds={[...memberIds, ...newMemberIds]}
                      onBlur={field.handleBlur}
                    />

                    <Collapse
                      isOpen={newMemberIds.length > 0}
                      contentClassName={clsx(
                        "relative transition-[padding] duration-300",
                        newMemberIds.length > 0 ? "pt-7" : "pt-0",
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
                        Nuevos miembros
                      </label>

                      <div className="flex max-h-50 flex-wrap gap-2 overflow-y-scroll pt-3">
                        {newMembers.map((p) => (
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
                                memberIds.length > 1 && (
                                  <Button
                                    aria-label="Remove selected user"
                                    type="button"
                                    onClick={() => handleRemoveNewMember(p.id)}
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

            {addExpenses && (
              <form.Field
                name="membersToAdd"
                validators={{
                  onChange: updateGroupSchema.shape.expensesToAdd,
                  onBlur: updateGroupSchema.shape.expensesToAdd,
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-y-8">
                    {/* <ExpenseSearchEngine
                      user={user}
                      onSelect={(p) =>
                        handleSelectNewMembers(p, field.handleChange)
                      }
                      excludeUserIds={[...memberIds, ...newMemberIds]}
                      onBlur={field.handleBlur}
                    /> */}

                    <Collapse
                      isOpen={newMemberIds.length > 0}
                      contentClassName={clsx(
                        "relative transition-[padding] duration-300",
                        newMemberIds.length > 0 ? "pt-7" : "pt-0",
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
                        Nuevos gastos
                      </label>

                      <div className="flex max-h-50 flex-wrap gap-2 overflow-y-scroll pt-3">
                        {/* {newExpenses.map((p) => (
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
                                memberIds.length > 1 && (
                                  <Button
                                    aria-label="Remove selected user"
                                    type="button"
                                    onClick={() => handleRemoveNewMember(p.id)}
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
                        ))} */}
                      </div>
                    </Collapse>
                  </div>
                )}
              </form.Field>
            )}

            {removeMember && (
              <p>
                ¿Estas seguro que deseas eliminar a{" "}
                <span className="text-semibold">{selectedMember.name}</span> del
                grupo?
              </p>
            )}

            {removeExpense && (
              <p>
                ¿Estas seguro que deseas eliminar el gasto{" "}
                <span className="text-semibold">{selectedExpense.name}</span>{" "}
                del grupo?
              </p>
            )}

            <Button
              type="submit"
              className="mt-4 lg:mt-7"
              loading={isPending}
              disabled={!isSendeable}
              fullWidth
            >
              {fieldsToUpdate.length > 1
                ? buttonLabels.default
                : buttonLabels[fieldsToUpdate[0]]}
            </Button>

            <form.Subscribe selector={(state) => [state.errorMap]}>
              {([errorMap]) => <FormErrorMessage message={errorMap.onServer} />}
            </form.Subscribe>
          </form>
        )}
      </>
    </Modal>
  );
};

export default UpdateGroupForm;
