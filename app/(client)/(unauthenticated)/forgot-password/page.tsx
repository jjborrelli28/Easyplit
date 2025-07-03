"use client";

import { useState } from "react";

import Link from "next/link";

import type { ResponseMessage } from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";

import AuthDivider from "@/components/AuthDivider";
import MessageCard from "@/components/MessageCard";
import PageContainer from "@/components/PageContainer";
import ForgotPasswordForm from "./_components/ForgotPasswordForm";

const ForgotPasswordPage = () => {
  const [successMessage, setSuccessMessage] = useState<ResponseMessage | null>(
    null,
  );

  if (successMessage) {
    return (
      <PageContainer centered>
        <MessageCard {...successMessage} icon={ICON_MAP[successMessage.icon]}>
          {successMessage.content}
        </MessageCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer centered>
      <div className="border-h-background my-8 w-full max-w-md space-y-8 border p-8 shadow-xl">
        <h1 className="text-3xl font-bold">¿Olvidaste tu contraseña?</h1>

        <div className="space-y-4">
          <p className="text-foreground/75">
            Ingresá tu email y te enviaremos un enlace para restablecer tu
            contraseña.
          </p>

          <ForgotPasswordForm setSuccessMessage={setSuccessMessage} />

          <AuthDivider />

          <div className="text-foreground/75 text-xs">
            ¿Ya recordaste tu contraseña?{" "}
            <Link href="/login" className="text-primary">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ForgotPasswordPage;
