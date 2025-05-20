"use client";

import { type FormEvent, useState, Suspense } from "react";

import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";

import clsx from "clsx";
import { CheckCircle, CircleAlert } from "lucide-react";

import useResetPassword from "@/hooks/auth/useResetPassword";

import { parseZodErrors } from "@/lib/validations/helpers";
import { resetPasswordSchema } from "@/lib/validations/schemas";

import AuthDivider from "@/components/AuthDivider";
import Button from "@/components/Button";
import Collapse from "@/components/Collapse";
import Input from "@/components/Input";
import MessageCard from "@/components/MessageCard";
import PageContainer from "@/components/PageContainer";

const initialErrorMessages = {
  password: null,
  result: null,
};

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: resetPassword, isPending } = useResetPassword();

  const [password, setPassword] = useState("");
  const [errorMessages, setErrorMessages] = useState<{
    password?: string | null;
    result?: string | null;
  }>(initialErrorMessages);
  const [successMessage, setSuccessMessage] = useState(false);

  const token = searchParams.get("token");

  if (!token) {
    notFound();
  }

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();

    setErrorMessages(initialErrorMessages);

    const body = { password };
    const verifiedFields = resetPasswordSchema.safeParse(body);

    if (!verifiedFields.success) {
      const fields = parseZodErrors(verifiedFields.error);

      setErrorMessages({
        ...initialErrorMessages,
        ...fields,
      });

      return;
    }

    resetPassword(body, {
      onSuccess: () => {
        setErrorMessages(initialErrorMessages);
        setSuccessMessage(true);

        setTimeout(() => {
          router.push("/login");
        }, 5000);
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
          color="success"
          icon={CheckCircle}
          title="¡Contraseña restablecida con éxito!"
          actionLabel="Iniciar sesión"
          actionHref="/login"
        >
          <div className="space-y-4">
            <p>Ahora podés iniciar sesión con tu nueva contraseña.</p>
            <p className="text-xs">En breve seras redirigido al Login.</p>
          </div>
        </MessageCard>
      ) : (
        <div className="border-h-background relative w-full max-w-md border p-8 text-center shadow-xl">
          <div
            className={clsx(
              "space-y-8",
              successMessage ? "opacity-0" : "opacity-100",
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
                  error={errorMessages.password}
                />

                <Button
                  type="submit"
                  fullWidth
                  className="mt-7"
                  loading={isPending}
                >
                  Restablecer contraseña
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

              <div className="text-foreground/75 text-xs">
                ¿Ya recordaste tu contraseña?{" "}
                <Link href="/login" className="text-primary">
                  Iniciar sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default ResetPasswordPage;
