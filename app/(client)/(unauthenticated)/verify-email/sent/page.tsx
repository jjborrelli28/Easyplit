"use client";

import { CheckCircle } from "lucide-react";

import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";

const VerifyEmailSentPage = () => {
  return (
    <PageContainer centered>
      <div className="border-success w-full max-w-md space-y-8 border-1 p-8 text-center shadow-xl">
        <div className="flex flex-col items-center gap-y-8">
          <CheckCircle className="text-success h-12 w-12" />

          <h1 className="text-success text-3xl font-semibold">
            ¡Verificá tu correo!
          </h1>
        </div>

        <p>
          Te enviamos un correo electrónico con un enlace para verificar tu
          cuenta. Por favor, revisá tu bandeja de entrada (y también el correo
          no deseado o spam).
        </p>

        <Button href="/" color="success" fullWidth>
          Volver al inicio
        </Button>
      </div>
    </PageContainer>
  );
};

export default VerifyEmailSentPage;
