"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import clsx from "clsx";

import useRegister from "@/lib/hooks/useRegister";
import { parseZodErrors } from "@/lib/validations/helpers";
import { registerSchema } from "@/lib/validations/schemas";

import Button from "@/components/Button";
import Input from "@/components/Input";

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
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-gray-800 p-8 shadow-xl">
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
                <p className="mt-1 mb-2 rounded border border-red-500 px-3 py-2 text-xs text-red-500">
                  {errors.response}
                </p>
              </div>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 font-semibold text-gray-700">
                O
              </span>
            </div>
          </div>

          <div className="text-center text-xs">
            ¿Ya tenés cuenta?{" "}
            <Button href="/login" unstyled>
              Iniciar sesión
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
