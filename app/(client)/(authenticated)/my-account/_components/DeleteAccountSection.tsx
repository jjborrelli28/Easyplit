import { useState } from "react";

import type { Session } from "next-auth";
import { signOut } from "next-auth/react";

import { useForm } from "@tanstack/react-form";

import useDeleteUser from "@/hooks/data/user/useDeleteUser";

import type {
  DeleteUserFields,
  ResponseMessage,
  ServerErrorResponse,
} from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";
import { deleteUserSchema } from "@/lib/validations/schemas";

import Button from "@/components/Button";
import FormErrorMessage from "@/components/FormErrorMessage";
import Input from "@/components/Input";
import MessageCard from "@/components/MessageCard";
import Modal from "@/components/Modal";

interface DeleteAccountSectionProps {
  user: Session["user"];
}

const DeleteAccountSection = ({ user }: DeleteAccountSectionProps) => {
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
      id: user.id!,
      password: "",
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
      <section className="flex flex-col gap-y-8">
        <h2 className="text-3xl font-semibold">Eliminar tu cuenta</h2>

        <div className="grid-rows-auto grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto]">
          <p className="border-h-background lg:border-r lg:pr-8">
            Esta acción eliminará permanentemente tu cuenta y todos los datos
            asociados. No podrás recuperar tu información ni acceder nuevamente
            con este correo electrónico. Asegurate de que esta es la acción que
            querés realizar.
          </p>

          <Button
            onClick={() => setModalIsOpen(true)}
            color="danger"
            className="h-fit min-w-40 justify-self-end"
          >
            Eliminar cuenta
          </Button>
        </div>
      </section>

      <Modal
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        showHeader={!message}
        title="¿Estás seguro que querés eliminar tu cuenta?"
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
            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-2">
                <p className="text-sm">
                  Esta acción eliminará tu cuenta permanentemente, incluyendo
                  todos tus datos y registros.
                </p>

                <p className="text-sm">
                  No podrás volver a acceder con este correo electrónico.
                </p>
              </div>

              <p>
                {user.hasPassword
                  ? "Para confirmar la eliminación de tu cuenta, ingresá tu contraseña actual:"
                  : "¿Estás seguro de que querés continuar?"}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="flex flex-col gap-y-8"
            >
              {user.hasPassword && (
                <form.Field
                  name="password"
                  validators={{
                    onBlur: deleteUserSchema.shape.password,
                  }}
                >
                  {(field) => (
                    <Input
                      id="password"
                      type="password"
                      label="Contraseña"
                      placeholder="Contraseña"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(e.target.value.trim())
                      }
                      onBlur={field.handleBlur}
                      autoComplete="password"
                      required
                      error={
                        field.state.meta.isTouched
                          ? field.state.meta.errors[0]?.message ||
                            field.state.meta.errorMap.onSubmit
                          : null
                      }
                      containerClassName="!pt-4"
                    />
                  )}
                </form.Field>
              )}

              <div className="flex flex-col">
                <div className="flex flex-col gap-y-4">
                  <Button
                    type="submit"
                    color="danger"
                    loading={isPending}
                    fullWidth
                  >
                    Eliminar cuenta
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

export default DeleteAccountSection;
