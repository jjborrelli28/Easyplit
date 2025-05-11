"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/Button";

const RegisterPage = () => {
  const router = useRouter();

  const [alias, setAlias] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ alias, email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) router.push("/dashboard");
    else alert("Ocurrió un error al registrarse");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md space-y-6 rounded-md border border-gray-800 bg-gray-900 p-8 shadow-md">
        <h1 className="text-3xl font-bold text-white">Crear cuenta</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            className="w-full rounded-md bg-gray-800 p-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
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
          <Button type="submit" fullWidth>
            Registrarse
          </Button>
        </form>

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

        <div className="text-center text-xs text-gray-400">
          ¿Ya tenés cuenta?{" "}
          <Button href="/login" unstyled>
            Iniciar sesión
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
