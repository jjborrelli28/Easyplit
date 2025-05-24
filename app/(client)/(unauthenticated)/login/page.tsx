"use client";

import { type FormEvent, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signIn } from "next-auth/react";

import googleLogo from "@/public/assets/logos/Google.svg?url";

import type { ErrorResponse } from "@/lib/api/types";
import { parseZodErrors } from "@/lib/validations/helpers";
import { loginSchema } from "@/lib/validations/schemas";

import AuthDivider from "@/components/AuthDivider";
import Button from "@/components/Button";
import FormErrorMessage from "@/components/FormErrorMessage";
import Input from "@/components/Input";
import PageContainer from "@/components/PageContainer";

const initialFieldErrors = {
  email: null,
  password: null,
  result: null,
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string | null;
    password?: string | null;
  }>(initialFieldErrors);
  const [responseError, setResponseError] = useState<string[] | null>(null);

  const handleLoginWithCredentials = (e: FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setFieldErrors(initialFieldErrors);
    setResponseError(null);

    const verifiedCredentials = loginSchema.safeParse({ email, password });

    if (!verifiedCredentials.success) {
      const fields = parseZodErrors(verifiedCredentials.error);

      setIsLoading(false);
      setFieldErrors({
        ...initialFieldErrors,
        ...fields,
      });

      return;
    }

    signIn("credentials", {
      email,
      password,
      redirect: false,
    }).then((res) => {
      setIsLoading(false);
      console.log(res);
      if (res?.ok) {
        redirect("/dashboard");
      } else if (res?.error) {
        const {
          message,
          fields,
        }: ErrorResponse<Record<string, string>>["error"] = JSON.parse(
          res.error,
        );

        if (fields) {
          setFieldErrors({
            ...initialFieldErrors,
            ...fields,
          });
        } else {
          setResponseError(message);
        }
      }
    });
  };

  const handleLoginWithGoogle = () => signIn("google");

  return (
    <PageContainer centered>
      <div className="border-h-background w-full max-w-md space-y-8 border p-8 shadow-xl">
        <h1 className="text-3xl font-bold">Iniciar sesión</h1>

        <div className="space-y-4">
          <div>
            <form
              onSubmit={handleLoginWithCredentials}
              className="flex flex-col gap-y-1"
            >
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
                loading={isLoading}
              >
                Iniciar sesión
              </Button>

              <FormErrorMessage message={responseError} />
            </form>

            <Link
              href="/forgot-password"
              className="text-foreground/75 text-xs"
            >
              ¿Has olvidado la contraseña?
            </Link>
          </div>

          <Button href="/register" variant="outlined" fullWidth>
            Crear cuenta
          </Button>

          <AuthDivider />

          <Button
            variant="outlined"
            color="secondary"
            onClick={handleLoginWithGoogle}
            fullWidth
          >
            <Image alt="Google" src={googleLogo} height={20} width={20} />

            <span>Iniciar sesión con Google</span>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default LoginPage;
