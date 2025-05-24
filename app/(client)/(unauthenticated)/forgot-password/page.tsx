"use client";

import { useState, type FormEvent } from "react";

import Link from "next/link";

import useForgotPassword from "@/hooks/auth/useForgotPassword";

import type { ResponseMessage } from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";
import { parseZodErrors } from "@/lib/validations/helpers";
import { forgotPasswordSchema } from "@/lib/validations/schemas";

import AuthDivider from "@/components/AuthDivider";
import Button from "@/components/Button";
import FormErrorMessage from "@/components/FormErrorMessage";
import Input from "@/components/Input";
import MessageCard from "@/components/MessageCard";
import PageContainer from "@/components/PageContainer";

const initialFieldErrors = {
  email: null,
};

const ForgotPasswordPage = () => {
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string | null;
  }>(initialFieldErrors);
  const [responseError, setResponseError] = useState<string[] | null>(null);
  const [message, setMessage] = useState<ResponseMessage | null>(null);

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();

    setFieldErrors(initialFieldErrors);
    setResponseError(null);

    const verifiedFields = forgotPasswordSchema.safeParse({ email });

    if (!verifiedFields.success) {
      const fields = parseZodErrors(verifiedFields.error);

      setFieldErrors({
        ...initialFieldErrors,
        ...fields,
      });

      return;
    }

    forgotPassword(
      { email },
      {
        onSuccess: (res) => {
          setFieldErrors(initialFieldErrors);
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
      },
    );
  };

  return (
    <PageContainer centered>
      {message ? (
        <MessageCard {...message} icon={ICON_MAP[message.icon]}>
          {message.content}
        </MessageCard>
      ) : (
        <div className="border-h-background w-full max-w-md space-y-8 border p-8 shadow-xl">
          <h1 className="text-3xl font-bold">¿Olvidaste tu contraseña?</h1>

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
                error={fieldErrors.email}
              />

              <Button
                type="submit"
                fullWidth
                className="mt-7"
                loading={isPending}
              >
                Enviar correo de recuperación
              </Button>

              <FormErrorMessage message={responseError} />
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
