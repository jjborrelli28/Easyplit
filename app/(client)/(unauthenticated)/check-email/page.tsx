"use client";

import { MailCheck } from "lucide-react";

import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";

const CheckEmailPage = () => {
  return (
    <PageContainer centered>
      <div className="border-h-background w-full max-w-md space-y-8 border p-8 text-center shadow-xl">
        <MailCheck className="text-primary mx-auto h-12 w-12" />

        <h1 className="text-3xl font-semibold">Revisá tu correo</h1>

        <div className="space-y-4">
          <p className="text-foreground/75 text-md">
            Si existe una cuenta con ese email, vas a recibir un enlace para
            restablecer tu contraseña.
          </p>

          <p className="text-foreground/75 text-sm">
            Recordá revisar también la carpeta de spam o promociones.
          </p>
        </div>

        <Button href="/login" fullWidth>
          Volver al inicio de sesión
        </Button>
      </div>
    </PageContainer>
  );
};

export default CheckEmailPage;
