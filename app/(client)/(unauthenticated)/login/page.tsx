"use client";

import { type FormEvent, useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signIn } from "next-auth/react";

import type ReCAPTCHA from "react-google-recaptcha";

import googleLogo from "@/public/assets/logos/Google.svg?url";

import type { ServerErrorResponse } from "@/lib/api/types";
import { parseZodErrors } from "@/lib/validations/helpers";
import { loginSchema, recaptchaTokenSchema } from "@/lib/validations/schemas";

import AuthDivider from "@/components/AuthDivider";
import Button from "@/components/Button";
import FormErrorMessage from "@/components/FormErrorMessage";
import Input from "@/components/Input";
import PageContainer from "@/components/PageContainer";
import ReCAPTCHAv2 from "@/components/ReCAPTCHAv2";

const initialFieldErrors = {
  email: null,
  password: null,
  recaptchaToken: null,
};

const LoginPage = () => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string | null;
    password?: string | null;
    recaptchaToken?: string | null;
  }>(initialFieldErrors);
  const [responseError, setResponseError] = useState<string[] | null>(null);

  const handleResetRecaptcha = () => {
    recaptchaRef.current?.reset();

    setRecaptchaToken(null);
  };

  const handleLoginWithCredentials = (e: FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setFieldErrors(initialFieldErrors);
    setResponseError(null);

    const credentialVerification = loginSchema.safeParse({
      email,
      password,
      recaptchaToken,
    });

    if (!credentialVerification.success) {
      const fields = parseZodErrors(credentialVerification.error);

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
      recaptchaToken,
      redirect: false,
    }).then((res) => {
      setIsLoading(false);

      if (res?.ok) {
        redirect("/dashboard");
      } else if (res?.error) {
        const {
          message,
          fields,
        }: ServerErrorResponse<{ email?: string; password?: string }>["error"] =
          JSON.parse(res.error);

        if (fields) {
          setFieldErrors({
            ...initialFieldErrors,
            ...fields,
          });
        } else {
          setResponseError(message);
        }

        handleResetRecaptcha();
      }
    });
  };

  const handleLoginWithGoogle = () => signIn("google");

  return (
    <PageContainer centered>
      <div className="border-h-background my-8 w-full max-w-md space-y-8 border p-8 shadow-xl">
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

              <ReCAPTCHAv2
                ref={recaptchaRef}
                onChange={(recaptchaToken) => {
                  const recaptchaTokenVerification =
                    recaptchaTokenSchema.safeParse({
                      recaptchaToken,
                    });

                  if (recaptchaTokenVerification.success) {
                    setRecaptchaToken(recaptchaToken);

                    setFieldErrors((prevState) => ({
                      ...prevState,
                      recaptchaToken: null,
                    }));
                  } else {
                    const { recaptchaToken } = parseZodErrors(
                      recaptchaTokenVerification.error,
                    );

                    setFieldErrors((prevState) => ({
                      ...prevState,
                      recaptchaToken,
                    }));
                  }
                }}
                onExpired={() => {
                  setRecaptchaToken(null);

                  setFieldErrors((prevState) => ({
                    ...prevState,
                    recaptchaToken:
                      "El reCAPTCHA expiró, por favor completalo nuevamente.",
                  }));
                }}
                error={fieldErrors.recaptchaToken}
              />

              <Button
                type="submit"
                fullWidth
                className="mt-4"
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
            onClick={handleLoginWithGoogle}
            variant="outlined"
            color="secondary"
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
