"use client";

import Image from "next/image";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";

import { Session } from "next-auth";
import { signOut } from "next-auth/react";

import Button from "../Button";
import Collapse from "../Collapse";
import Dropdown from "../Dropdown";
import EasyplitLogo from "../EasyplitLogo";
import ThemeToggle from "../ThemeToggle";

interface AuthenticatedContentProps {
  isOpen: boolean;
  user: Session["user"];
}

const AuthenticatedContent = ({ isOpen, user }: AuthenticatedContentProps) => {
  const pathname = usePathname();

  const handleLogout = () => {
    signOut();
    redirect("/");
  };

  const isMyAccountPage = pathname === "/my-account";
  const isDashboardPage = pathname === "/dashboard";
  const isRecentActivityPage = pathname === "/recent-activity";
  const isAllExpensesPage = pathname === "/all-expenses";

  return (
    <div className="container mx-auto flex w-full flex-col p-4 md:flex-row md:items-center md:justify-between">
      <Link href="/">
        <EasyplitLogo isAnimated />
      </Link>

      <Collapse
        isOpen={isOpen}
        className="md:!grid-rows-[1fr] md:!opacity-100"
        containerClassName="md:overflow-visible"
      >
        <div className="border-foreground mt-4 flex flex-col gap-6 border-t py-6 md:mt-0 md:flex-row md:items-center md:border-t-0 md:py-0">
          <nav className="flex flex-col gap-6 md:hidden md:flex-row md:items-center">
            {!isMyAccountPage && (
              <Button
                href="/my-account"
                unstyled
                className="hover:text-foreground/90 w-fit font-semibold transition-colors duration-300"
              >
                Mi cuenta
              </Button>
            )}
            {!isDashboardPage && (
              <Button
                href="/dashboard"
                unstyled
                className="hover:text-foreground/90 w-fit font-semibold transition-colors duration-300"
              >
                Panel de control
              </Button>
            )}
            {!isRecentActivityPage && (
              <Button
                href="/recent-activity"
                unstyled
                className="hover:text-foreground/90 w-fit font-semibold transition-colors duration-300"
              >
                Actividad reciente
              </Button>
            )}
            {!isAllExpensesPage && (
              <Button
                href="/all-expenses"
                unstyled
                className="hover:text-foreground/90 w-fit font-semibold transition-colors duration-300"
              >
                Todos los gastos
              </Button>
            )}
            <Button
              onClick={handleLogout}
              unstyled
              className="hover:text-foreground/90 w-fit cursor-pointer font-semibold transition-colors duration-300"
            >
              Cerrar sesión
            </Button>
          </nav>

          <Dropdown
            label={
              <>
                {user.image && (
                  <Image
                    alt="Avatar"
                    src={user.image}
                    height={40}
                    width={40}
                    className="border-primary rounded-full border"
                  />
                )}

                {user.name}
              </>
            }
            items={[
              {
                label: "Mi perfil",
                onClick: () => redirect("/my-account"),
              },
              { label: "Cerrar sesión", onClick: handleLogout },
            ]}
            variant="text"
            className="!py-0 !pr-0 hover:!bg-transparent"
            containerClassName="!hidden md:!inline-block"
          />

          <div className="bg-primary hidden h-10 w-[1px] md:block" />

          <ThemeToggle />
        </div>
      </Collapse>
    </div>
  );
};

export default AuthenticatedContent;
