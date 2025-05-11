"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import googleLogo from "@/public/assets/logos/Google.svg?url";

import { Button } from "@/components/Button";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) router.push("/dashboard");
    else alert("Email o contraseña incorrectos");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md space-y-6 rounded-md border border-gray-800 bg-gray-900 p-8 shadow-md">
        <h1 className="text-3xl font-bold text-white">Iniciar sesión</h1>
        <div className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Usuario ó E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-gray-800 p-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-gray-800 p-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div>
              <Button type="submit" fullWidth>
                Iniciar sesión
              </Button>
              <Button href="#" unstyled className="text-xs">
                ¿Has olvidado la contraseña?
              </Button>
            </div>
          </form>

          <div className="flex flex-col gap-y-2">
            <Button href="/register" variant="outlined" fullWidth>
              Crear cuenta
            </Button>
          </div>

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
