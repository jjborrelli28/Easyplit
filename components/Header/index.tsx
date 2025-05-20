"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut, useSession } from "next-auth/react";

import Button from "@/components/Button";
import ThemeToggle from "@/components/ThemeToggle";

const Header = () => {
  const { status } = useSession();
  const pathname = usePathname();

  const isAuthenticated = status === "authenticated";
  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";

  const handleLogout = () => signOut();

  const authenticatedLinks = (
    <Button onClick={handleLogout} unstyled className="cursor-pointer">
      Cerrar sesión
    </Button>
  );

  const unauthenticatedLinks = (
    <>
      {!isLoginPage && (
        <Button href="/login" unstyled className="mx-3 my-2 font-semibold">
          Iniciar sesión
        </Button>
      )}
      {!isRegisterPage && <Button href="/register">Registrarse</Button>}
    </>
  );

  return (
    <header className="fixed w-full justify-end p-4 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/">
          <Image
            alt="Easyplit"
            src={"https://lucide.dev/logo.dark.svg"}
            height={40}
            width={40}
          />
        </Link>

        <div className="flex items-center gap-x-6">
          <nav className="flex items-center justify-end gap-x-6">
            {isAuthenticated ? authenticatedLinks : unauthenticatedLinks}
          </nav>

          <div className="bg-primary h-10 w-[1px]" />

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
