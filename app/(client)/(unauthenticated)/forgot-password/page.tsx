"use client";

import { useState, type FormEvent } from "react";

import Link from "next/link";

import { CircleAlert, MailCheck } from "lucide-react";

import useForgotPassword from "@/hooks/auth/useForgotPassword";

import { parseZodErrors } from "@/lib/validations/helpers";
import { forgotPasswordSchema } from "@/lib/validations/schemas";

import AuthDivider from "@/components/AuthDivider";
import Button from "@/components/Button";
import Collapse from "@/components/Collapse";
import Input from "@/components/Input";
import MessageCard from "@/components/MessageCard";
import PageContainer from "@/components/PageContainer";

const initialErrorMessages = {
  email: null,
  result: null,
};

const ForgotPasswordPage = () => {
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const [email, setEmail] = useState("");
  const [errorMessages, setErrorsMessages] = useState<{
    email?: string | null;
    result?: string | null;
  }>(initialErrorMessages);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();

    setErrorsMessages(initialErrorMessages);

    const verifiedFields = forgotPasswordSchema.safeParse({ email });

    if (!verifiedFields.success) {
      const fields = parseZodErrors(verifiedFields.error);

      setErrorsMessages({
        ...initialErrorMessages,
        ...fields,
      });

      return;
    }

    forgotPassword(
      { email },
      {
        onSuccess: () => {
          setErrorsMessages(initialErrorMessages);
          setSuccessMessage(true);
        },
        onError: (res) => {
          const { error } = res.response.data;

          if (error.fields) {
            setErrorsMessages({
              ...initialErrorMessages,
              ...error.fields,
            });
          } else {
            setErrorsMessages({
              ...initialErrorMessages,
              result: error.result,
            });
          }
        },
      },
    );
  };

  return (
    <PageContainer centered>
      {successMessage ? (
        <MessageCard
          icon={MailCheck}
          title="Revisá tu correo"
          actionLabel="Volver al inicio de sesión"
          actionHref="/login"
        >
          <div className="space-y-4">
            <p>
              Si existe una cuenta con ese email, vas a recibir un enlace para
              restablecer tu contraseña.
            </p>
            <p>Recordá revisar también la carpeta de spam o promociones.</p>
          </div>
        </MessageCard>
      ) : (
        <div className="border-h-background w-full max-w-md space-y-8 border p-8 text-center shadow-xl">
          <h1 className="text-3xl font-bold text-nowrap">
            ¿Olvidaste tu contraseña?
          </h1>

          <div className="space-y-4">
            <p className="text-foreground/75">
              Ingresá tu email y te enviaremos un enlace para restablecer tu
              contraseña.
            </p>

            <form
              onSubmit={handleForgotPassword}
              className="flex max-w-md flex-col gap-y-1"
            >
              <Input
                id="email"
                type="email"
                label="Correo electrónico"
                placeholder="ejemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                error={errorMessages.email}
              />

              <Button
                type="submit"
                fullWidth
                className="mt-7"
                loading={isPending}
              >
                Enviar enlace
              </Button>

              <Collapse open={!!errorMessages.result}>
                <div className="border-danger text-danger mt-2 mb-3 flex items-center border">
                  <div className="flex h-full items-center px-3 py-2">
                    <CircleAlert className="text-danger h-5 w-5" />
                  </div>

                  <p className="border-danger border-l px-3 py-2 text-xs">
                    {errorMessages.result}
                  </p>
                </div>
              </Collapse>
            </form>

            <AuthDivider />

            <div className="text-foreground/75 text-xs">
              ¿Ya recordaste tu contraseña?{" "}
              <Link href="/login" className="text-primary">
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default ForgotPasswordPage;
