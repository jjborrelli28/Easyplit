"use client";

import { CheckCircle } from "lucide-react";

import Button from "@/components/Button";

const VerifyEmailSentPage = () => {
  return (
    <main className="bg-red container mx-auto flex min-h-screen items-center justify-center px-4 py-12">
      <div className="border-success w-full max-w-2xl space-y-8 rounded-xl border-2 p-8 shadow-xl">
        <div className="flex items-center gap-2.5">
          <CheckCircle className="text-success h-10 w-10" />
          <h1 className="text-success text-3xl font-semibold">
            ¡Verificá tu correo!
          </h1>
        </div>

        <p>
          Te enviamos un correo electrónico con un enlace para verificar tu
          cuenta. Por favor, revisá tu bandeja de entrada (y también el correo
          no deseado o spam).
        </p>

        <Button href="/">Volver al inicio</Button>
      </div>
    </main>
  );
};

export default VerifyEmailSentPage;
