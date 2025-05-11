"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import Button from "@/components/Button";
import Input from "@/components/Input";

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
        <div className="space-y-4">
          <form onSubmit={handleRegister} className="flex flex-col gap-y-1">
            <Input
              id="user"
              label="Nombre de usuario"
              placeholder="Nombre de usuario"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              required
            />
            <Input
              id="email"
              type="email"
              label="Correo electrónico"
              placeholder="Correo electrónico"
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

          <div className="text-center text-xs">
            ¿Ya tenés cuenta?{" "}
            <Button href="/login" unstyled>
              Iniciar sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
