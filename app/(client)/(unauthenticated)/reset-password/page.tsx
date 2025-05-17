"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import clsx from "clsx";
import { CheckCircle, CircleAlert } from "lucide-react";

import useResetPassword from "@/lib/hooks/auth/useResetPassword";
import { parseZodErrors } from "@/lib/validations/helpers";
import { resetPasswordSchema } from "@/lib/validations/schemas";

import AuthDivider from "@/components/AuthDivider";
import Button from "@/components/Button";
import Collapse from "@/components/Collapse";
import Input from "@/components/Input";
import PageContainer from "@/components/PageContainer";

const errorsInitialState = {
  password: "",
  response: "",
};

const ResetPasswordPage = () => {
  const router = useRouter();
  const { mutate, isPending } = useResetPassword();

  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState(errorsInitialState);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();

    const body = { password };
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      const errors = parseZodErrors(result.error);
      const { password } = errors;

      setErrors({
        ...errorsInitialState,
        password: password ?? "",
      });

      return;
    }

    mutate(body, {
      onSuccess: () => {
        setErrors(errorsInitialState);
        setShowSuccessMessage(true);

        setTimeout(() => {
          router.push("/login");
        }, 5000);
      },
      onError: (error) => {
        const { errors, error: message } = error.response?.data || {};

        if (errors) {
          setErrors({
            ...errorsInitialState,
            password: errors.password ?? "",
          });
        } else {
          setErrors({
            ...errorsInitialState,
            response:
              message ??
              "Ocurrió un error inesperado al intentar restablecer la contraseña",
          });
        }
      },
    });
  };

  return (
    <PageContainer centered>
      <div className="border-h-background relative w-full max-w-md border p-8 text-center shadow-xl">
        <div
          className={clsx(
            "space-y-8",
            showSuccessMessage ? "opacity-0" : "opacity-100",
          )}
        >
          <h1 className="text-3xl font-bold">Cambiá tu contraseña</h1>

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
                error={errors.password}
              />

              <Button
                type="submit"
                fullWidth
                className="mt-7"
                loading={isPending}
              >
                Restablecer contraseña
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

        <div
          className={clsx(
            "bg-background absolute top-0 left-0 flex h-full w-full flex-col justify-between p-8 transition-opacity duration-300",
            showSuccessMessage
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
        >
          <div className="flex flex-col items-center gap-y-8">
            <CheckCircle className="text-success h-12 w-12" />

            <h2 className="text-success text-3xl font-semibold">
              ¡Contraseña actualizada con éxito!
            </h2>

            <p className="text-sm">
              Ahora podés iniciar sesión con tu nueva contraseña. En breve seras
              redirigido
            </p>
          </div>

          <Button href="/login" color="success" fullWidth>
            Ir al login
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default ResetPasswordPage;
