import { notFound } from "next/navigation";

import { AlertTriangle, CheckCircle, CircleAlert, Clock10 } from "lucide-react";

import MessageCard, { type MessageCardProps } from "@/components/MessageCard";
import PageContainer from "@/components/PageContainer";

type State = "token_expired" | "success" | "already_verified" | "error";

const messageCardProps: Record<State, MessageCardProps> = {
  token_expired: {
    color: "primary",
    icon: Clock10,
    title: "El enlace expiró",
    children: (
      <div className="space-y-2">
        <p>
          El enlace de verificación ha expirado por cuestiones de seguridad.
        </p>
        <p>Podés volver a registrarte para recibir uno nuevo.</p>
      </div>
    ),
    actionLabel: "Volver a registrarte",
    actionHref: "/register",
  },
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
    icon: AlertTriangle,
    title: "Algo salió mal",
    children: (
      <div className="space-y-2">
        <p>Ocurrió un error inesperado en el servidor.</p>
        <p>Por favor, intentá nuevamente en unos minutos.</p>
      </div>
    ),
    actionLabel: "Volver al inicio",
    actionHref: "/",
  },
};

interface VerifyEmailResultPageProps {
  searchParams: Promise<{ status?: State }>;
}

const VerifyEmailResultPage = async ({
  searchParams,
}: VerifyEmailResultPageProps) => {
  const { status } = await searchParams;

  if (
    !status ||
    !["token_expired", "success", "already_verified", "error"].includes(status)
  ) {
    notFound();
  }

  return (
    <PageContainer centered>
      <MessageCard titleTag="h1" {...messageCardProps[status]} />
    </PageContainer>
  );
};

export default VerifyEmailResultPage;
