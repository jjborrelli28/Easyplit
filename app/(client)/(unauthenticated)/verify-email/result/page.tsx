import { notFound } from "next/navigation";

import { CheckCircle, CircleAlert, CircleX } from "lucide-react";

import MessageCard, { type MessageCardProps } from "@/components/MessageCard";
import PageContainer from "@/components/PageContainer";

const messageCardProps: Record<States, MessageCardProps> = {
  success: {
    color: "success",
    icon: CheckCircle,
    title: "¡Cuenta verificada!",
    children: (
      <div className="space-y-2">
        <p>
          Te confirmamos que tu dirección de correo fue verificada con éxito.
        </p>
        <p>Ya podés iniciar sesión y empezar a usar Easyplit!</p>
      </div>
    ),
    actionLabel: "Iniciar sesión",
    actionHref: "/login",
  },
  ["already_verified"]: {
    color: "warning",
    icon: CircleAlert,
    title: "Correo ya verificado",
    children: (
      <div className="space-y-2">
        <p>
          Tu dirección de correo electrónico ya había sido verificada
          previamente.
        </p>
        <p>Podés iniciar sesión para continuar usando Easyplit.</p>
      </div>
    ),
    actionLabel: "Iniciar sesión",
    actionHref: "/login",
  },
  error: {
    color: "danger",
    icon: CircleX,
    title: "Hubo un problema",
    children: (
      <div className="space-y-2">
        <p>No pudimos verificar tu correo electrónico.</p>
        <p>Es posible que el enlace no sea valido o haya sido utilizado.</p>
        <p>Vuelve a intentar crear tu cuenta.</p>
      </div>
    ),
    actionLabel: "Volve a intentar registrate",
    actionHref: "/register",
  },
};

type States = "success" | "already_verified" | "error";

interface VerifyEmailResultPageProps {
  searchParams: Promise<{ status?: States }>;
}

const VerifyEmailResultPage = async ({
  searchParams,
}: VerifyEmailResultPageProps) => {
  const { status } = await searchParams;

  if (!status || !["success", "already_verified", "error"].includes(status)) {
    notFound();
  }

  return (
    <PageContainer centered>
      <MessageCard titleTag="h1" {...messageCardProps[status]} />
    </PageContainer>
  );
};

export default VerifyEmailResultPage;
