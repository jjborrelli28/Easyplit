"use client";

import Image from "next/image";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";

import { Session } from "next-auth";
import { signOut } from "next-auth/react";

import { CTA } from ".";
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
      <Link href="/" className="w-fit">
        <EasyplitLogo isAnimated />
      </Link>

      <Button
        href="/my-account"
        unstyled
        className="absolute top-4 right-18 md:hidden"
      >
        {user.image && (
          <Image
            alt="Avatar"
            src={user.image}
            height={40}
            width={40}
            className="border-secondary rounded-full border-2 transition-opacity hover:opacity-90"
          />
        )}
      </Button>

      <Collapse
        isOpen={isOpen}
        className="md:!grid-rows-[1fr] md:!opacity-100"
        containerClassName="md:overflow-visible"
      >
        <div className="border-foreground box-sizing mt-4 flex flex-col gap-6 border-t py-6 md:mt-0 md:flex-row md:items-center md:border-t-0 md:py-0">
          <nav className="flex flex-col gap-6 md:hidden md:flex-row md:items-center">
            <CTA href="/dashboard" isActive={isDashboardPage}>
              Panel de control
            </CTA>
            <CTA href="/recent-activity" isActive={isRecentActivityPage}>
              Actividad reciente
            </CTA>
            <CTA href="/all-expenses" isActive={isAllExpensesPage}>
              Todos los gastos
            </CTA>

            <hr className="border-foreground" />

            <CTA href="/my-account" isActive={isMyAccountPage}>
              Mi cuenta
            </CTA>
            <CTA onClick={handleLogout}>Cerrar sesión</CTA>
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
                    className="border-secondary rounded-full border-2"
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
            color="secondary"
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
