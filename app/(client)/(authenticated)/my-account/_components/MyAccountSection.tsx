import { useState } from "react";

import Image from "next/image";

import type { Session } from "next-auth";
import { useSession } from "next-auth/react";

import { useForm } from "@tanstack/react-form";
import clsx from "clsx";

import useUpdateUser from "@/hooks/user/useUpdateUser";

import type {
  ResponseMessage,
  ServerErrorResponse,
  UpdateUserFields,
} from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";
import { updateUserSchema } from "@/lib/validations/schemas";

import Button from "@/components/Button";
import FormErrorMessage from "@/components/FormErrorMessage";
import Input from "@/components/Input";
import MessageCard from "@/components/MessageCard";
import Modal from "@/components/Modal";

interface MyAccountSectionProps {
  user: Session["user"];
}

const MyAccountSection = ({ user }: MyAccountSectionProps) => {
  const { update } = useSession();

  const { mutate: updateUser, isPending } = useUpdateUser();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [message, setMessage] = useState<ResponseMessage | null>(null);

  const form = useForm<
    UpdateUserFields,
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
      name: user.name!,
      password: "",
      currentPassword: "",
    },
    onSubmit: async ({ value }) => {
      updateUser(value, {
        onSuccess: (res) => {
          form.reset();

          res?.message && setMessage(res.message);
        },
        onError: (res) => {
          const {
            error: { message, fields = {} },
          }: ServerErrorResponse<UpdateUserFields> = res.response.data;

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
    form.setFieldValue("currentPassword", undefined);
  };

  const currentUser = user;
  const nameUpdated = form.state.values.name !== currentUser.name;
  const passwordUpdated = form.state.values.password !== "";

  return (
    <>
      <section className="flex flex-col gap-y-8">
        <h1 className="text-3xl font-bold">Mi cuenta</h1>

        <div className="grid-rows-auto grid w-full grid-cols-1 gap-8 lg:grid-cols-[auto_1fr]">
          <div className="relative mx-auto aspect-square h-50 w-50 rounded-full">
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
            <form id="fake-form" className="hidden" />

            <form.Field
              name="name"
              validators={{
                onChange: updateUserSchema.shape.name,
              }}
              children={(field) => (
                <Input
                  form="fake-form"
                  id="name"
                  label="Nombre"
                  placeholder="Nombre"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value.trim())}
                  autoComplete="name"
                  required
                  editableToggle
                  disabled={true}
                  error={
                    field.state.meta.errors[0]?.message ||
                    field.state.meta.errorMap.onSubmit
                  }
                  containerClassName="order-1"
                />
              )}
            />

            {user.hasPassword && (
              <form.Field
                name="password"
                validators={{
                  onChange: updateUserSchema.shape.password,
                }}
                children={(field) => (
                  <>
                    <Input
                      form="fake-form"
                      id="password"
                      type="password"
                      label="Nueva contraseña"
                      placeholder="Nueva contraseña"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(e.target.value.trim())
                      }
                      autoComplete="password"
                      required
                      editableToggle
                      disabled={true}
                      error={
                        field.state.meta.errors[0]?.message ||
                        field.state.meta.errorMap.onSubmit
                      }
                      containerClassName="order-2 xl:order-3"
                    />
                  </>
                )}
              />
            )}

            {/* Not editable */}
            <Input
              id="email"
              type="email"
              label="Correo electrónico"
              placeholder="Correo electrónico"
              value={currentUser.email!}
              autoComplete="email"
              required
              disabled={true}
              labelClassName="!text-foreground/75"
              containerClassName="order-3 xl:order-2"
              className="text-foreground/75 !border-b-transparent"
            />
          </div>

          <form.Subscribe
            selector={(state) => state}
            children={({ values, fieldMeta }) => {
              const nameUpdated = values.name !== currentUser.name;
              const passwordUpdated = values.password !== "";
              const isSendable =
                (nameUpdated || passwordUpdated) &&
                fieldMeta.name.isValid &&
                fieldMeta.password.isValid;

              return (
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
              );
            }}
          />
        </div>
      </section>

      <Modal
        isOpen={modalIsOpen}
        onClose={handleCloseModal}
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
                await update();

                handleCloseModal();
              },
            }}
          >
            {message.content}
          </MessageCard>
        ) : (
          <>
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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="flex flex-col gap-y-8"
            >
              {passwordUpdated && (
                <form.Field
                  name="currentPassword"
                  validators={{
                    onBlur: updateUserSchema.shape.currentPassword,
                  }}
                  children={(field) => (
                    <>
                      <Input
                        id="currentPassword"
                        type="password"
                        label="Contraseña actual"
                        placeholder="Contraseña actual"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(e.target.value.trim())
                        }
                        onBlur={field.handleBlur}
                        autoComplete="currentPassword"
                        required
                        error={
                          field.state.meta.errors[0]?.message ||
                          field.state.meta.errorMap.onSubmit
                        }
                        containerClassName="!pt-4"
                      />
                    </>
                  )}
                />
              )}

              <div className="flex flex-col">
                <div className="flex flex-col gap-y-4">
                  <Button
                    type="submit"
                    color="success"
                    loading={isPending}
                    fullWidth
                  >
                    Aceptar
                  </Button>

                  <Button
                    onClick={handleCloseModal}
                    color="secondary"
                    fullWidth
                  >
                    Cancelar
                  </Button>
                </div>

                <form.Subscribe
                  selector={(state) => [state.errorMap]}
                  children={([errorMap]) => (
                    <FormErrorMessage
                      message={errorMap.onServer}
                      containerClassName="!mt-4 !mb-0"
                    />
                  )}
                />
              </div>
            </form>
          </>
        )}
      </Modal>
    </>
  );
};

export default MyAccountSection;
