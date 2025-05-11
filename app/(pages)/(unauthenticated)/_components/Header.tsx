"use client";

import { usePathname } from "next/navigation";

import Button from "@/components/Button";

const Header = () => {
  const pathname = usePathname();

  const isLogin = pathname === "/login";
  const isRegister = pathname === "/register";

  return (
    <header className="fixed w-full justify-end bg-gray-900 p-4">
      <nav className="container flex items-center justify-end gap-x-6">
        {!isLogin && (
          <Button href="/login" unstyled className="mx-3 my-2 font-semibold">
            Iniciar sesión
          </Button>
        )}
        {!isRegister && <Button href="/register">Registrarse</Button>}
      </nav>
    </header>
  );
};

export default Header;
