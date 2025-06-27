import { type FormEvent, useState } from "react";

import Image from "next/image";

import type { Session } from "next-auth";
import { useSession } from "next-auth/react";

import clsx from "clsx";

import useUpdateUser from "@/hooks/user/useUpdateUser";

import type { ResponseMessage } from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";
import { parseZodErrors } from "@/lib/validations/helpers";
import { nameSchema, passwordSchema } from "@/lib/validations/schemas";

import Button from "@/components/Button";
import FormErrorMessage from "@/components/FormErrorMessage";
import Input from "@/components/Input";
import MessageCard from "@/components/MessageCard";
import Modal from "@/components/Modal";

const initialFieldErrors = {
  name: null,
  password: null,
  currentPassword: null,
};

interface MyAccountSectionProps {
  user: Session["user"];
}

const MyAccountSection = ({ user }: MyAccountSectionProps) => {
  const { mutate: updateUser, isPending } = useUpdateUser();
  const { update } = useSession();

  const currentUser = user;

  const [name, setName] = useState(currentUser.name);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(currentUser.email); // Not editable yet
  const [currentPassword, setCurrentPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string | null;
    password?: string | null;
    currentPassword?: string | null;
  }>(initialFieldErrors);
  const [responseError, setResponseError] = useState<string[] | null>(null);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [message, setMessage] = useState<ResponseMessage | null>(null);

  const passwordIsModified = !!user.hasPassword && !!password;

  const handleUpdateUser = async (e: FormEvent) => {
    e.preventDefault();

    if (!user.id) return;

    if (password) {
      const res = passwordSchema.safeParse({
        password: currentPassword,
      });

      if (!res.success) {
        const fields = parseZodErrors(res.error);

        setFieldErrors({
          ...initialFieldErrors,
          ...{ currentPassword: fields.password },
        });

        return;
      } else {
        setFieldErrors(initialFieldErrors);
      }
    }

    const body = {
      id: user.id,
      ...(name && { name }),
      ...(passwordIsModified && { password, currentPassword }),
    };

    updateUser(body, {
      onSuccess: (res) => {
        setResponseError(null);
        res?.message && setMessage(res.message);
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

  const nameUpdated = name !== currentUser.name;
  const passwordUpdated = password !== "";

  const userWereEdited = nameUpdated || passwordUpdated;
  const fieldsWithErrors = !!fieldErrors.name || !!fieldErrors.password;
  const isSendable = userWereEdited && !fieldsWithErrors;

  return (
    <>
      <section className="flex flex-col gap-y-8">
        <h1 className="text-3xl font-bold">Mi cuenta</h1>

        <div className="grid-rows-auto grid w-full grid-cols-1 gap-8 lg:grid-cols-[auto_1fr]">
          <div className="border-foregrund relative mx-auto aspect-square h-50 w-50 rounded-full border-2">
            {user?.image && (
              <Image
                alt="Avatar"
                src={user.image}
                fill
                sizes="196px"
                className="rounded-full"
              />
            )}
          </div>

          <div className="border-h-background grid-rows-auto grid w-full grid-cols-1 gap-4 border-t pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 xl:grid-cols-2 2xl:gap-8">
            {name !== null && (
              <Input
                id="name"
                type="text"
                label="Nombre"
                placeholder="Nombre"
                value={name}
                onChange={(e) => {
                  const name = e.target.value;

                  setName(name);

                  const verifiedField = nameSchema.safeParse({
                    name,
                  });

                  if (verifiedField.success) {
                    setFieldErrors((prevState) => ({
                      ...prevState,
                      name: null,
                    }));
                  } else {
                    const fields = parseZodErrors(verifiedField.error);

                    setFieldErrors({
                      ...initialFieldErrors,
                      ...fields,
                    });
                  }
                }}
                autoComplete="name"
                required
                editableToggle
                disabled={true}
                error={fieldErrors.name}
                containerClassName="order-1"
              />
            )}
            {user.hasPassword && (
              <Input
                id="password"
                type="password"
                label="Nueva contraseña"
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => {
                  const password = e.target.value;

                  setPassword(password);
                  if (password === "")
                    return setFieldErrors((prevState) => ({
                      ...prevState,
                      password: null,
                    }));

                  const verifiedField = passwordSchema.safeParse({
                    password,
                  });

                  if (verifiedField.success) {
                    setFieldErrors((prevState) => ({
                      ...prevState,
                      password: null,
                    }));
                  } else {
                    const fields = parseZodErrors(verifiedField.error);

                    setFieldErrors({
                      ...initialFieldErrors,
                      ...fields,
                    });
                  }
                }}
                autoComplete="current-password"
                required
                editableToggle
                disabled={true}
                error={fieldErrors.password}
                containerClassName="order-2 xl:order-3"
              />
            )}
            {email !== null && (
              <Input
                id="email"
                type="email"
                label="Correo electrónico"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={true}
                labelClassName="!text-foreground/75"
                containerClassName="order-3 xl:order-2"
                className="text-foreground/75 !border-b-transparent"
              />
            )}
          </div>

          <Button
            onClick={() => setModalIsOpen(true)}
            className={clsx(
              "col-span-full min-w-40 justify-self-end",
              !isSendable && "!bg-gray-600 dark:!bg-gray-200",
            )}
            disabled={!isSendable}
          >
            Aplicar cambios
          </Button>
        </div>
      </section>

      <Modal
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        showHeader={!message}
        title="Confirmar cambios"
      >
        {message ? (
          <MessageCard
            {...message}
            icon={ICON_MAP[message.icon]}
            countdown={{
              color: message.color,
              start: 3,
              onComplete: async () => {
                await update({ name });

                setModalIsOpen(false);
              },
            }}
          >
            {message.content}
          </MessageCard>
        ) : (
          <>
            <div className="flex flex-col gap-y-8">
              <p>
                Para guardar los cambios en tus datos personales, por favor
                ingresá tu contraseña actual.
              </p>

              <p className="text-sm italic">
                {nameUpdated && passwordUpdated
                  ? "“Estás por modificar tu nombre y tu contraseña.”"
                  : nameUpdated
                    ? "“Estás a punto de actualizar tu nombre.”"
                    : "“Estás a punto de cambiar tu contraseña.”"}
              </p>

              {password && (
                <div>
                  <Input
                    id="current-password"
                    type="password"
                    label="Contraseña actual"
                    placeholder="Contraseña actual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    error={fieldErrors.currentPassword}
                    containerClassName="!pt-4"
                  />

                  <FormErrorMessage message={responseError} />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-x-4">
              <Button
                onClick={() => setModalIsOpen(false)}
                variant="outlined"
                color="secondary"
              >
                Cancelar
              </Button>

              <Button
                onClick={handleUpdateUser}
                color="success"
                loading={isPending}
              >
                Aceptar
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default MyAccountSection;
