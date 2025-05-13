"use client";

import { usePathname } from "next/navigation";
// import Image from "next/image";

import Button from "@/components/Button";
// import easyplitLogo from "@/public/assets/logos/Easyplit_CombinationMark_Dark.png";
// import Link from "next/link";

const Header = () => {
  const pathname = usePathname();

  const isLogin = pathname === "/login";
  const isRegister = pathname === "/register";

  return (
    <header className="fixed w-full justify-end p-4">
      <div className="container mx-auto flex justify-between">
        {/* 
        <Link href="/">
        <Image alt="Easyplit" src={easyplitLogo} className="w-30" />
        </Link> 
        */}

        <nav className="container flex items-center justify-end gap-x-6">
          {!isLogin && (
            <Button href="/login" unstyled className="mx-3 my-2 font-semibold">
              Iniciar sesión
            </Button>
          )}
          {!isRegister && <Button href="/register">Registrarse</Button>}
        </nav>
      </div>
    </header>
  );
};

export default Header;
