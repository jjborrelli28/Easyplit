"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuthQuery } from "@/lib/hooks/useAuth";

import ThemeToggle from "@/theme/ThemeToggle";

import Button from "@/components/Button";
import useLogout from "@/lib/hooks/useLogout";

const Header = () => {
  const { data: user } = useAuthQuery();
  const { mutate: logout } = useLogout();

  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;
  const isLogin = pathname === "/login";
  const isRegister = pathname === "/register";

  const unauthenticatedLinks = (
    <>
      {!isLogin && (
        <Button href="/login" unstyled className="mx-3 my-2 font-semibold">
          Iniciar sesión
        </Button>
      )}
      {!isRegister && <Button href="/register">Registrarse</Button>}
    </>
  );

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        router.push("/login");
      },
    });
  };

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
            {isAuthenticated ? (
              <Button
                onClick={handleLogout}
                unstyled
                className="cursor-pointer"
              >
                Cerrar sesión
              </Button>
            ) : (
              unauthenticatedLinks
            )}
          </nav>

          <div className="bg-primary h-10 w-[1px]" />

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
