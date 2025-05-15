"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import clsx from "clsx";

import useRegister from "@/lib/hooks/useRegister";
import { parseZodErrors } from "@/lib/validations/helpers";
import { registerSchema } from "@/lib/validations/schemas";

import AuthDivider from "@/components/AuthDivider";
import Button from "@/components/Button";
import Input from "@/components/Input";
import PageContainer from "@/components/PageContainer";

const errorsInitialState = {
  alias: "",
  email: "",
  password: "",
  response: "",
};

const RegisterPage = () => {
  const router = useRouter();
  const { mutate, isPending } = useRegister();

  const [alias, setAlias] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState(errorsInitialState);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();

    const body = { alias, email, password };
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const errors = parseZodErrors(result.error);
      const { alias, email, password } = errors;

      setErrors({
        ...errorsInitialState,
        alias: alias ?? "",
        email: email ?? "",
        password: password ?? "",
      });

      return;
    }

    mutate(body, {
      onSuccess: () => {
        setErrors(errorsInitialState);
        router.push("/auth/verify-email/sent");
      },
      onError: (error) => {
        const { errors, error: message } = error.response?.data || {};

        if (errors) {
          setErrors({
            ...errorsInitialState,
            alias: errors.alias ?? "",
            email: errors.email ?? "",
            password: errors.password ?? "",
          });
        } else {
          setErrors({
            ...errorsInitialState,
            response: message ?? "Ocurrió un error inesperado al registrarse",
          });
        }
      },
    });
  }

  return (
    <PageContainer>
      <div className="border-highlighted-background w-full max-w-md space-y-6 border p-8 shadow-xl">
        <h1 className="text-3xl font-bold">Crear cuenta</h1>

        <div className="space-y-4">
          <form onSubmit={handleRegister} className="flex flex-col gap-y-1">
            <Input
              id="alias"
              type="text"
              label="Nombre ó alias"
              placeholder="Nombre ó alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              required
              error={errors.alias}
            />
            <Input
              id="email"
              type="email"
              label="Correo electrónico"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              error={errors.email}
            />
            <Input
              id="password"
              type="password"
              label="Contraseña"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              error={errors.password}
            />

            <Button
              type="submit"
              fullWidth
              className="mt-7"
              loading={isPending}
            >
              Registrarse
            </Button>

            <div
              className={clsx(
                "grid-rows-auto grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity]",
                errors.response && "grid-rows-[1fr] opacity-100",
              )}
            >
              <div className="overflow-hidden">
                <p className="border-danger text-danger mt-1 mb-2 border px-3 py-2 text-xs">
                  {errors.response}
                </p>
              </div>
            </div>
          </form>

          <AuthDivider />

          <div className="text-foreground/60 text-center text-xs">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-primary">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default RegisterPage;
