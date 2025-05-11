"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import clsx from "clsx";

import googleLogo from "@/public/assets/logos/Google.svg?url";

import Button from "@/components/Button";
import Input from "@/components/Input";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<null | string>(null);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Email o contraseña incorrectos");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-gray-800 bg-gray-900 p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white">Iniciar sesión</h1>
        <div className="space-y-4">
          <div>
            <form onSubmit={handleLogin} className="flex flex-col gap-y-1">
              <Input
                id="email"
                label="Usuario ó E-mail"
                placeholder="Usuario ó E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                id="password"
                type="password"
                label="Contraseña"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button type="submit" fullWidth className="mt-7">
                Iniciar sesión
              </Button>

              <div
                className={clsx(
                  "grid-rows-auto grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity]",
                  error && "grid-rows-[1fr] opacity-100",
                )}
              >
                <div className="overflow-hidden">
                  <p className="mt-1 mb-2 rounded border border-red-500 px-3 py-2 text-xs text-red-500">
                    {error}
                  </p>
                </div>
              </div>
            </form>

            <Button href="#" unstyled className="text-xs">
              ¿Has olvidado la contraseña?
            </Button>
          </div>

          <Button href="/register" variant="outlined" fullWidth>
            Crear cuenta
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-900 px-4 font-semibold text-gray-700">
                O
              </span>
            </div>
          </div>

          <Button
            href="/api/auth/0/login"
            variant="outlined"
            color="secondary"
            fullWidth
          >
            <Image alt="Google" src={googleLogo} height={20} width={20} />
            <span>Iniciar sesión con Google</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
