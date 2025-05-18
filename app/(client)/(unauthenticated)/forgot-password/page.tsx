"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { CircleAlert, MailCheck } from "lucide-react";

import useForgotPassword from "@/lib/hooks/auth/useForgotPassword";
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
  response: null,
};

const ForgotPasswordPage = () => {
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const [email, setEmail] = useState("");
  const [errorMessages, setErrorsMessages] = useState<{
    email: string | null;
    response: string | null;
  }>(initialErrorMessages);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();

    const result = forgotPasswordSchema.safeParse({ email });

    if (!result.success) {
      const fieldErrors = parseZodErrors(result.error);

      setErrorsMessages({
        ...initialErrorMessages,
        ...fieldErrors,
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
        onError: (err) => {
          const { error, fieldErrors } = err.response.data;

          if (fieldErrors) {
            setErrorsMessages({
              ...initialErrorMessages,
              ...fieldErrors,
            });
          } else {
            setErrorsMessages({
              ...initialErrorMessages,
              response:
                error ??
                "Ocurrió un error inesperado al intentar enviar el correo",
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

              <Collapse open={!!errorMessages.response}>
                <p className="border-danger text-danger mt-2 mb-3 flex items-center gap-x-1.5 border px-3 py-2 text-xs">
                  <CircleAlert className="text-danger h-3.5 w-3.5" />
                  {errorMessages.response}
                </p>
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
