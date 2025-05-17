"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { CircleAlert } from "lucide-react";

import useRegister from "@/lib/hooks/auth/useRegister";
import { parseZodErrors } from "@/lib/validations/helpers";
import { registerSchema } from "@/lib/validations/schemas";

import AuthDivider from "@/components/AuthDivider";
import Button from "@/components/Button";
import Collapse from "@/components/Collapse";
import Input from "@/components/Input";
import PageContainer from "@/components/PageContainer";

const errorsInitialState = {
  name: "",
  email: "",
  password: "",
  response: "",
};

const RegisterPage = () => {
  const router = useRouter();
  const { mutate: register, isPending } = useRegister();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState(errorsInitialState);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    const body = { name, email, password };
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const errors = parseZodErrors(result.error);
      const { name, email, password } = errors;

      setErrors({
        ...errorsInitialState,
        name: name ?? "",
        email: email ?? "",
        password: password ?? "",
      });

      return;
    }

    register(body, {
      onSuccess: () => {
        setErrors(errorsInitialState);

        router.push("/verify-email/sent");
      },
      onError: (err) => {
        const { error, fieldErrors } = err.response.data;

        if (fieldErrors) {
          setErrors({
            ...errorsInitialState,
            name: fieldErrors.name ?? "",
            email: fieldErrors.email ?? "",
            password: fieldErrors.password ?? "",
          });
        } else {
          setErrors({
            ...errorsInitialState,
            response: error ?? "Ocurrió un error inesperado al registrarse",
          });
        }
      },
    });
  };

  return (
    <PageContainer centered>
      <div className="border-h-background w-full max-w-md space-y-8 border p-8 shadow-xl">
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
              required
              error={errors.name}
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

            <Collapse open={!!errors.response}>
              <p className="border-danger text-danger mt-2 mb-3 flex items-center gap-x-1.5 border px-3 py-2 text-xs">
                <CircleAlert className="text-danger h-3.5 w-3.5" />

                {errors.response}
              </p>
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
    </PageContainer>
  );
};

export default RegisterPage;
