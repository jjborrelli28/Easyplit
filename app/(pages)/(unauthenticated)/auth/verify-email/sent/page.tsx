"use client";

import { CheckCircle } from "lucide-react";

import Button from "@/components/Button";

const VerifyEmailSentPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-12 text-white">
      <div className="w-full max-w-xl rounded-xl bg-gray-900 p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <CheckCircle className="h-10 w-10 text-green-500" />
          <h1 className="text-3xl font-semibold">¡Verificá tu correo!</h1>
        </div>

        <p className="mb-6 text-gray-300">
          Te enviamos un correo electrónico con un enlace para verificar tu
          cuenta. Por favor, revisá tu bandeja de entrada (y también el correo
          no deseado o spam).
        </p>

        <Button href="/">Volver al inicio</Button>
      </div>
    </div>
  );
};

export default VerifyEmailSentPage;
