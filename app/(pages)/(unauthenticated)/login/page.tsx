"use client";

import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import googleLogo from "@/public/assets/logos/Google.svg?url";

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
              <button
                type="submit"
                className="m-0 w-full cursor-pointer rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition-colors duration-300 hover:bg-blue-700"
              >
                Iniciar sesión
              </button>
              <NextLink href="" className="text-xs text-blue-600">
                ¿Has olvidado la contraseña?
              </NextLink>
            </div>
          </form>

          <div className="flex flex-col gap-y-2">
            <NextLink
              href="/register"
              className="10 m-0 w-full cursor-pointer rounded-md border border-blue-950 bg-transparent px-6 py-3 text-center font-semibold text-white transition-colors duration-300 hover:bg-blue-950"
            >
              Crear cuenta
            </NextLink>
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

          <NextLink
            href="/api/auth/0/login"
            className="m-0 flex w-full cursor-pointer items-center justify-center gap-x-4 rounded-md border border-gray-700 px-6 py-3 text-center font-semibold text-white transition-colors duration-300 hover:bg-gray-700"
          >
            <Image alt="Google" src={googleLogo} height={20} width={20} />
            <span>Iniciar sesión con Google</span>
          </NextLink>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
