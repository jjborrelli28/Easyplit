"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Button from "@/components/Button";
import ThemeToggle from "@/theme/ThemeToggle";

const Header = () => {
  const pathname = usePathname();

  const isLogin = pathname === "/login";
  const isRegister = pathname === "/register";

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
            {!isLogin && (
              <Button
                href="/login"
                unstyled
                className="mx-3 my-2 font-semibold"
              >
                Iniciar sesión
              </Button>
            )}
            {!isRegister && <Button href="/register">Registrarse</Button>}
          </nav>

          <div className="bg-primary h-10 w-[1px]" />

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
