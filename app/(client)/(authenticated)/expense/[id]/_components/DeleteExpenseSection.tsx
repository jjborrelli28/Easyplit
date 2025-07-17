import { useState } from "react";

import { signOut } from "next-auth/react";

import { useForm } from "@tanstack/react-form";

import useDeleteUser from "@/hooks/data/user/useDeleteUser";

import type {
  DeleteUserFields,
  ResponseMessage,
  ServerErrorResponse,
} from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";

import Button from "@/components/Button";
import FormErrorMessage from "@/components/FormErrorMessage";
import MessageCard from "@/components/MessageCard";
import Modal from "@/components/Modal";

interface DeleteAccountSectionProps {
  expenseId: string;
}

const DeleteExpenseSection = ({ expenseId }: DeleteAccountSectionProps) => {
  const { mutate: deleteUser, isPending } = useDeleteUser();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [message, setMessage] = useState<ResponseMessage | null>(null);

  const form = useForm<
    DeleteUserFields,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    () => string[],
    undefined
  >({
    defaultValues: {
      id: expenseId,
    },
    onSubmit: async ({ value }) => {
      deleteUser(value, {
        onSuccess: (res) => {
          form.reset();

          res?.message && setMessage(res.message);
        },
        onError: (res) => {
          const {
            error: { message, fields = {} },
          }: ServerErrorResponse<DeleteUserFields> = res.response.data;

          form.setErrorMap({
            onSubmit: {
              fields,
            },
            onServer: message,
          });
        },
      });
    },
  });

  const handleCloseModal = () => {
    setModalIsOpen(false);
    form.reset();
  };

  return (
    <>
      <hr className="border-h-background" />

      <section className="flex justify-end">
        <div className="w-full lg:w-auto">
          <Button
            aria-label="Remove expense"
            onClick={() => setModalIsOpen(true)}
            color="danger"
            fullWidth
          >
            Eliminar gasto
          </Button>
        </div>
      </section>

      <Modal
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        showHeader={!message}
        title="¿Estás seguro que querés eliminar el gasto?"
      >
        {message ? (
          <MessageCard
            {...message}
            icon={ICON_MAP[message.icon]}
            countdown={{
              color: message.color,
              start: 3,
              onComplete: async () => {
                await signOut({ callbackUrl: "/" });

                setModalIsOpen(false);
              },
            }}
          >
            {message.content}
          </MessageCard>
        ) : (
          <>
            <p className="text-sm">
              Esta acción eliminará tu gasto permanentemente.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="flex flex-col gap-y-8"
            >
              <div className="flex flex-col">
                <div className="flex flex-col gap-y-4">
                  <Button
                    type="submit"
                    color="danger"
                    loading={isPending}
                    fullWidth
                  >
                    Eliminar gasto
                  </Button>

                  <Button
                    onClick={handleCloseModal}
                    color="secondary"
                    fullWidth
                  >
                    Cancelar
                  </Button>
                </div>

                <form.Subscribe selector={(state) => [state.errorMap]}>
                  {([errorMap]) => (
                    <FormErrorMessage
                      message={errorMap.onServer}
                      contentClassName="!mt-4 !mb-0"
                    />
                  )}
                </form.Subscribe>
              </div>
            </form>
          </>
        )}
      </Modal>
    </>
  );
};

export default DeleteExpenseSection;
