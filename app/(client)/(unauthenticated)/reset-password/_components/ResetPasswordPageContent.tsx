"use client";

import { type FormEvent, useState } from "react";

import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";

import useResetPassword from "@/hooks/auth/useResetPassword";

import type { ResponseMessage } from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";
import { parseZodErrors } from "@/lib/validations/helpers";
import { passwordSchema } from "@/lib/validations/schemas";

import AuthDivider from "@/components/AuthDivider";
import Button from "@/components/Button";
import FormErrorMessage from "@/components/FormErrorMessage";
import Input from "@/components/Input";
import MessageCard from "@/components/MessageCard";
import PageContainer from "@/components/PageContainer";

const initialFieldErrors = {
  password: null,
};

const ResetPasswordPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: resetPassword, isPending } = useResetPassword();

  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string | null;
  }>(initialFieldErrors);
  const [responseError, setResponseError] = useState<string[] | null>(null);
  const [message, setMessage] = useState<ResponseMessage | null>(null);

  const token = searchParams.get("token");

  if (!token) {
    notFound();
  }

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();

    setFieldErrors(initialFieldErrors);
    setResponseError(null);

    const body = { password };
    const verifiedField = passwordSchema.safeParse({ password });

    if (!verifiedField.success) {
      const fields = parseZodErrors(verifiedField.error);

      setFieldErrors({
        ...initialFieldErrors,
        ...fields,
      });

      return;
    }

    resetPassword(body, {
      onSuccess: (res) => {
        setFieldErrors(initialFieldErrors);
        setResponseError(null);
        setMessage(res.message);

        setTimeout(() => {
          router.push("/login");
        }, 5000);
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
    <PageContainer centered>
      {message ? (
        <MessageCard {...message} icon={ICON_MAP[message.icon]}>
          {message.content}
        </MessageCard>
      ) : (
        <div className="border-h-background relative my-8 w-full max-w-md space-y-8 border p-8 shadow-xl">
          <h1 className="text-3xl font-bold"> Cambiá tu contraseña </h1>

          <div className="space-y-4">
            <p className="text-foreground/75 text-md">
              Ingresá tu nueva contraseña para completar el proceso.
            </p>

            <form
              onSubmit={handleResetPassword}
              className="flex flex-col gap-y-1"
            >
              <Input
                id="password"
                type="password"
                label="Nueva contraseña"
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                error={fieldErrors.password}
              />

              <Button
                type="submit"
                fullWidth
                className="mt-7"
                loading={isPending}
              >
                Restablecer contraseña
              </Button>

              <FormErrorMessage message={responseError} />
            </form>

            <AuthDivider />

            <div className="text-foreground/75 text-center text-xs">
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

export default ResetPasswordPageContent;
