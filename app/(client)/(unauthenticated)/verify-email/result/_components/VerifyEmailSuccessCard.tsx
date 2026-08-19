"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { signIn } from "next-auth/react";

import { CheckCircle } from "lucide-react";

import MessageCard from "@/components/MessageCard";

interface VerifyEmailSuccessCardProps {
  signInToken?: string;
}

const VerifyEmailSuccessCard = ({
  signInToken,
}: VerifyEmailSuccessCardProps) => {
  const router = useRouter();

  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleLogin = async () => {
    if (!signInToken) {
      router.push("/login");
      return;
    }

    setIsSigningIn(true);

    const res = await signIn("email-verification", {
      signInToken,
      redirect: false,
    });

    if (res?.ok) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <MessageCard
      titleTag="h1"
      color="success"
      icon={CheckCircle}
      title="¡Cuenta verificada!"
      actionLabel={isSigningIn ? "Iniciando sesión..." : "Iniciar sesión"}
      onAction={handleLogin}
    >
      <div className="space-y-2">
        <p>
          Te confirmamos que tu dirección de correo fue verificada con éxito.
        </p>
        <p>Ya podés iniciar sesión y empezar a usar Easyplit!</p>
      </div>
    </MessageCard>
  );
};

export default VerifyEmailSuccessCard;
