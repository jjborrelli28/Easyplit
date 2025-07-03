"use client";

import { useState } from "react";

import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";

import type { ResponseMessage } from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";

import AuthDivider from "@/components/AuthDivider";
import MessageCard from "@/components/MessageCard";
import PageContainer from "@/components/PageContainer";
import ResetPasswordForm from "./ResetPasswordForm";

const ResetPasswordPage = () => {
  const searchParams = useSearchParams();

  const [successMessage, setSuccessMessage] = useState<ResponseMessage | null>(
    null,
  );

  const token = searchParams.get("token");

  if (!token) notFound();

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
        <h1 className="text-3xl font-bold">Cambiá tu contraseña</h1>

        <div className="space-y-4">
          <p className="text-foreground/75">
            Ingresá tu nueva contraseña para completar el proceso.
          </p>

          <ResetPasswordForm
            token={token}
            setSuccessMessage={setSuccessMessage}
          />

          <AuthDivider />

          <div className="text-foreground/75 text-center text-xs">
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

export default ResetPasswordPage;
