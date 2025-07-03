"use client";

import { useState } from "react";

import Link from "next/link";

import { ResponseMessage } from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";

import AuthDivider from "@/components/AuthDivider";
import MessageCard from "@/components/MessageCard";
import PageContainer from "@/components/PageContainer";
import RegisterForm from "./_components/RegisterForm";

const RegisterPage = () => {
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
      <div className="border-h-background relative my-8 w-full max-w-md space-y-8 border p-8 shadow-xl">
        <h1 className="text-3xl font-bold">Crear cuenta</h1>

        <div className="space-y-4">
          <RegisterForm setSuccessMessage={setSuccessMessage} />

          <AuthDivider />

          <div className="text-foreground/75 text-center text-xs">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-primary font-semibold">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default RegisterPage;
