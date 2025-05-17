"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { CircleAlert } from "lucide-react";

import useForgotPassword from "@/lib/hooks/auth/useForgotPassword";
import { parseZodErrors } from "@/lib/validations/helpers";
import { forgotPasswordSchema } from "@/lib/validations/schemas";

import AuthDivider from "@/components/AuthDivider";
import Button from "@/components/Button";
import Collapse from "@/components/Collapse";
import Input from "@/components/Input";
import PageContainer from "@/components/PageContainer";

const errorsInitialState = {
  email: "",
  response: "",
};

const ForgotPasswordPage = () => {
  const router = useRouter();
  const { mutate, isPending } = useForgotPassword();

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState(errorsInitialState);

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();

    const result = forgotPasswordSchema.safeParse({ email });

    if (!result.success) {
      const parsedErrors = parseZodErrors(result.error);
      setErrors({
        ...errorsInitialState,
        email: parsedErrors.email ?? "",
      });
      return;
    }

    mutate(
      { email },
      {
        onSuccess: () => {
          setErrors(errorsInitialState);

          router.push("/check-email");
        },
        onError: (err) => {
          const { errors, error } = err.response.data || {};

          if (errors) {
            setErrors({
              ...errorsInitialState,
              email: errors.email ?? "",
            });
          } else {
            setErrors({
              ...errorsInitialState,
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
              error={errors.email}
            />

            <Button
              type="submit"
              fullWidth
              className="mt-7"
              loading={isPending}
            >
              Enviar enlace
            </Button>

            <Collapse open={!!errors.response}>
              <p className="border-danger text-danger mt-2 mb-3 flex items-center gap-x-1.5 border px-3 py-2 text-xs">
                <CircleAlert className="text-danger h-3.5 w-3.5" />
                {errors.response}
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
    </PageContainer>
  );
};

export default ForgotPasswordPage;
