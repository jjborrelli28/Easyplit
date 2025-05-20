"use client";

import { type FormEvent, useState } from "react";

import Link from "next/link";

import { CircleAlert, MailCheck } from "lucide-react";

import useRegister from "@/hooks/auth/useRegister";
import { parseZodErrors } from "@/lib/validations/helpers";
import { registerSchema } from "@/lib/validations/schemas";

import AuthDivider from "@/components/AuthDivider";
import Button from "@/components/Button";
import Collapse from "@/components/Collapse";
import Input from "@/components/Input";
import MessageCard from "@/components/MessageCard";
import PageContainer from "@/components/PageContainer";

const initialErrorMessages = {
  name: null,
  email: null,
  password: null,
  result: null,
};

const RegisterPage = () => {
  const { mutate: register, isPending } = useRegister();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessages, setErrorMessages] = useState<{
    name?: string | null;
    email?: string | null;
    password?: string | null;
    result?: string | null;
  }>(initialErrorMessages);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    setErrorMessages(initialErrorMessages);

    const body = { name, email, password };
    const verifiedFields = registerSchema.safeParse(body);

    if (!verifiedFields.success) {
      const fields = parseZodErrors(verifiedFields.error);

      setErrorMessages({
        ...initialErrorMessages,
        ...fields,
      });

      return;
    }

    register(body, {
      onSuccess: () => {
        setErrorMessages(initialErrorMessages);
        setSuccessMessage(true);
      },
      onError: (res) => {
        const { error } = res.response.data;

        if (error.fields) {
          setErrorMessages({
            ...initialErrorMessages,
            ...error.fields,
          });
        } else {
          setErrorMessages({
            ...initialErrorMessages,
            result: error.result,
          });
        }
      },
    });
  };

  return (
    <PageContainer centered>
      {successMessage ? (
        <MessageCard
          color="primary"
          icon={MailCheck}
          title="¡Verificá tu correo!"
          actionLabel="Volver al inicio"
          actionHref="/"
        >
          <div className="space-y-4">
            <p>
              Te enviamos un correo electrónico con un enlace para verificar tu
              cuenta.
            </p>
            <p className="text-xs">
              Por favor, revisá tu bandeja de entrada (y también el correo no
              deseado o spam).
            </p>
          </div>
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
                error={errorMessages.name}
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
                error={errorMessages.email}
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
                error={errorMessages.password}
              />

              <Button
                type="submit"
                fullWidth
                className="mt-7"
                loading={isPending}
              >
                Registrarse
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
