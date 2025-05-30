"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import clsx from "clsx";

import { CTA } from ".";
import Collapse from "../Collapse";
import EasyplitLogo from "../EasyplitLogo";
import ThemeToggle from "../ThemeToggle";

interface UnauthenticatedContentProps {
  isOpen: boolean;
}

const UnauthenticatedContent = ({ isOpen }: UnauthenticatedContentProps) => {
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";

  return (
    <div className="container mx-auto flex w-full flex-col p-4 md:flex-row md:items-center md:justify-between">
      <Link href="/">
        <EasyplitLogo isAnimated />
      </Link>

      <Collapse isOpen={isOpen} className="md:!grid-rows-[1fr] md:!opacity-100">
        <div className="border-foreground mt-4 flex flex-col gap-6 border-t py-6 md:mt-0 md:flex-row md:items-center md:border-t-0 md:py-0">
          <nav className="flex flex-col gap-6 md:flex-row md:items-center">
            <CTA
              href="/login"
              isActive={isLoginPage}
              className={clsx("md:px-4 md:py-2", isLoginPage && "md:hidden")}
            >
              Iniciar sesión
            </CTA>

            <CTA
              href="/register"
              isActive={isRegisterPage}
              className={clsx(
                "md:bg-primary md:hover:text-background md:text-background md:hover:bg-primary/90 md:px-4 md:py-2",
                isRegisterPage && "md:hidden",
              )}
            >
              Registrarse
            </CTA>
          </nav>

          <div className="bg-primary hidden h-10 w-[1px] md:block" />

          <ThemeToggle />
        </div>
      </Collapse>
    </div>
  );
};

export default UnauthenticatedContent;
