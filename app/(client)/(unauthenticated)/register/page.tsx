"use client";

import { type FormEvent, useState } from "react";

import Link from "next/link";

import useRegister from "@/hooks/auth/useRegister";
import type { ResponseMessage } from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";
import { parseZodErrors } from "@/lib/validations/helpers";
import { registerSchema } from "@/lib/validations/schemas";

import AuthDivider from "@/components/AuthDivider";
import Button from "@/components/Button";
import FormErrorMessage from "@/components/FormErrorMessage";
import Input from "@/components/Input";
import MessageCard from "@/components/MessageCard";
import PageContainer from "@/components/PageContainer";

const initialFieldErrors = {
  name: null,
  email: null,
  password: null,
};

const RegisterPage = () => {
  const { mutate: register, isPending } = useRegister();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string | null;
    email?: string | null;
    password?: string | null;
  }>(initialFieldErrors);
  const [responseError, setResponseError] = useState<string[] | null>(null);
  const [message, setMessage] = useState<ResponseMessage | null>(null);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    setFieldErrors(initialFieldErrors);
    setResponseError(null);

    const body = { name, email, password };
    const verifiedFields = registerSchema.safeParse(body);

    if (!verifiedFields.success) {
      const fields = parseZodErrors(verifiedFields.error);

      setFieldErrors({
        ...initialFieldErrors,
        ...fields,
      });

      return;
    }

    register(body, {
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
    });
  };

  return (
    <PageContainer centered>
      {message ? (
        <MessageCard {...message} icon={ICON_MAP[message.icon]}>
          {message.content}
        </MessageCard>
      ) : (
        <div className="border-h-background relative w-full max-w-md space-y-8 border p-8 shadow-xl">
          <h1 className="text-3xl font-bold">Crear cuenta</h1>

          <div className="space-y-4">
            <form onSubmit={handleRegister} className="flex flex-col gap-y-1">
              <Input
                id="name"
                type="text"
                label="Nombre"
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="given-name"
                required
                error={fieldErrors.name}
              />
              <Input
                id="email"
                type="email"
                label="Correo electrónico"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                error={fieldErrors.email}
              />
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
              />

              <Button
                type="submit"
                fullWidth
                className="mt-7"
                loading={isPending}
              >
                Registrarse
              </Button>

              <FormErrorMessage message={responseError} />
            </form>

            <AuthDivider />

            <div className="text-foreground/75 text-center text-xs">
              ¿Ya tenés cuenta?{" "}
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

export default RegisterPage;
