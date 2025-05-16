"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { Link } from "lucide-react";

import Button from "@/components/Button";
import ThemeToggle from "@/theme/ThemeToggle";

const Header = () => {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });

    router.push("/login");
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
            <Button onClick={logout} unstyled className="cursor-pointer">
              Cerrar sesión
            </Button>
          </nav>

          <div className="bg-primary h-10 w-[1px]" />

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
