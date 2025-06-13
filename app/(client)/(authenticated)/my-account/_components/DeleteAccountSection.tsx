import { type FormEvent, useState } from "react";

import type { Session } from "next-auth";
import { signOut } from "next-auth/react";

import useDeleteUser from "@/hooks/auth/useDeleteUser";

import type { ResponseMessage } from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";
import { parseZodErrors } from "@/lib/validations/helpers";
import { passwordSchema } from "@/lib/validations/schemas";

import Button from "@/components/Button";
import FormErrorMessage from "@/components/FormErrorMessage";
import Input from "@/components/Input";
import MessageCard from "@/components/MessageCard";
import Modal from "@/components/Modal";

const initialFieldErrors = {
  password: null,
};

interface DeleteAccountSectionProps {
  user: Session["user"];
}

const DeleteAccountSection = ({ user }: DeleteAccountSectionProps) => {
  const { mutate: deleteUser, isPending } = useDeleteUser();

  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string | null;
  }>(initialFieldErrors);
  const [responseError, setResponseError] = useState<string[] | null>(null);

  const [isOpenModal, setIsOpenModal] = useState(false);

  const [message, setMessage] = useState<ResponseMessage | null>(null);

  const handleDeleteUser = async (e: FormEvent) => {
    e.preventDefault();

    if (!user.id) return;

    if (user.hasPassword) {
      const res = passwordSchema.safeParse({
        password,
      });

      if (!res.success) {
        const fields = parseZodErrors(res.error);

        setFieldErrors({
          ...initialFieldErrors,
          ...fields,
        });

        return;
      } else {
        setFieldErrors(initialFieldErrors);
      }
    }

    const body = {
      data: {
        id: user.id,
        ...(user.hasPassword && { password }),
      },
    };

    deleteUser(body, {
      onSuccess: (res) => {
        setResponseError(null);
        setMessage(res.message);
      },
      onError: (res) => {
        const {
          error: { message, fields },
        } = res.response.data;

        if (fields) {
          setFieldErrors({
            ...initialFieldErrors,
            ...fields,
          });
        } else {
          setResponseError(message);
        }
      },
    });
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
            onClick={() => setIsOpenModal(true)}
            color="danger"
            className="h-fit min-w-40 justify-self-end"
          >
            Eliminar cuenta
          </Button>
        </div>
      </section>

      <Modal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
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

                setIsOpenModal(false);
              },
            }}
          >
            {message.content}
          </MessageCard>
        ) : (
          <>
            <div className="flex flex-col gap-y-8">
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

                {
                  <p>
                    {user.hasPassword
                      ? "Para confirmar la eliminación de tu cuenta, ingresá tu contraseña actual:"
                      : "¿Estás seguro de que querés continuar?"}
                  </p>
                }
              </div>

              {user.hasPassword && (
                <div>
                  <Input
                    id="password"
                    type="password"
                    label="Contraseña"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    error={fieldErrors.password}
                    containerClassName="!pt-4"
                  />

                  <FormErrorMessage message={responseError} />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-x-4">
              <Button
                onClick={() => setIsOpenModal(false)}
                variant="outlined"
                color="secondary"
              >
                Cancelar
              </Button>

              <Button
                onClick={handleDeleteUser}
                color="danger"
                loading={isPending}
                className="min-w-40"
              >
                Eliminar cuenta
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default DeleteAccountSection;
