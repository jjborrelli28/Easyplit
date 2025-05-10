"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const Header = () => {
  const pathname = usePathname();

  const isLogin = pathname === "/login";
  const isRegister = pathname === "/register";

  return (
    <header className="fixed w-full justify-end bg-gray-900 p-4">
      <nav className="container flex items-center justify-end gap-x-6">
        {!isLogin && (
          <Link href="/login" className="font-semibold">
            Iniciar sesión
          </Link>
        )}
        {!isRegister && (
          <Link
            href="/register"
            className="hover:bg-blue-70 m-0 cursor-pointer rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition-colors duration-300"
          >
            Registrarse
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
