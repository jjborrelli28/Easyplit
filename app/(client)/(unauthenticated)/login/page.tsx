"use client";

import { type FormEvent, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signIn } from "next-auth/react";

import { CircleAlert } from "lucide-react";

import googleLogo from "@/public/assets/logos/Google.svg?url";

import { parseZodErrors } from "@/lib/validations/helpers";
import { loginSchema } from "@/lib/validations/schemas";

import AuthDivider from "@/components/AuthDivider";
import Button from "@/components/Button";
import Collapse from "@/components/Collapse";
import Input from "@/components/Input";
import PageContainer from "@/components/PageContainer";

const initialErrorMessages = {
  email: null,
  password: null,
  result: null,
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState<{
    email?: string | null;
    password?: string | null;
    result?: string | null;
  }>(initialErrorMessages);

  const handleLoginWithCredentials = (e: FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setErrorMessages(initialErrorMessages);

    const verifiedCredentials = loginSchema.safeParse({ email, password });

    if (!verifiedCredentials.success) {
      const credentials = parseZodErrors(verifiedCredentials.error);

      setIsLoading(false);
      setErrorMessages({
        ...initialErrorMessages,
        ...credentials,
      });

      return;
    }

    signIn("credentials", {
      email,
      password,
      redirect: false,
    }).then((res) => {
      setIsLoading(false);

      if (res?.ok) {
        redirect("/dashboard");
      } else if (res?.error) {
        const { credentials, result } = JSON.parse(res.error);

        if (credentials) {
          setErrorMessages({
            ...initialErrorMessages,
            ...credentials,
          });
        } else {
          setErrorMessages({
            ...initialErrorMessages,
            result,
          });
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
                loading={isLoading}
              >
                Iniciar sesión
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
