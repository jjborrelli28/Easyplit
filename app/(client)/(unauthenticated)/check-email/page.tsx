"use client";

import { MailCheck } from "lucide-react";

import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";
import MessageCard from "@/components/MessageCard";

const CheckEmailPage = () => {
  return (
    <PageContainer centered>
      <MessageCard
        icon={MailCheck}
        title="Revisá tu correo"
        actionLabel="Volver al inicio de sesión"
        actionHref="/login"
      >
        <div className="space-y-4">
          <p>
            Si existe una cuenta con ese email, vas a recibir un enlace para
            restablecer tu contraseña.
          </p>
          <p>Recordá revisar también la carpeta de spam o promociones.</p>
        </div>
      </MessageCard>
    </PageContainer>
  );
};

export default CheckEmailPage;
