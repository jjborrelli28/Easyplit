"use client";

import Image from "next/image";
import Link from "next/link";

import { signIn } from "next-auth/react";

import googleLogo from "@/public/assets/logos/Google.svg?url";

import AuthDivider from "@/components/AuthDivider";
import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";
import LoginForm from "./_components/LoginForm";

const LoginPage = () => {
  return (
    <PageContainer centered>
      <div className="border-h-background my-8 w-full max-w-md space-y-8 border p-8 shadow-xl">
        <h1 className="text-3xl font-bold">Iniciar sesión</h1>
        <div className="space-y-4">
          <div>
            <LoginForm />

            <Link
              href="/forgot-password"
              className="text-foreground/75 text-xs"
            >
              ¿Has olvidado la contraseña?
            </Link>
          </div>

          <Button href="/register" variant="outlined" fullWidth>
            Crear cuenta
          </Button>

          <AuthDivider />

          <Button
            onClick={() => signIn("google")}
            variant="outlined"
            color="secondary"
            fullWidth
          >
            <Image alt="Google" src={googleLogo} height={20} width={20} />

            <span>Iniciar sesión con Google</span>
          </Button>
        </div>{" "}
      </div>
    </PageContainer>
  );
};

export default LoginPage;
