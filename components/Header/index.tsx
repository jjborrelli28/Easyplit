"use client";

import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";

import clsx from "clsx";

import Button, { type ButtonProps } from "../Button";
import LoadingBar from "../LoadingBar";
import MenuButton from "../MenuButton";
import AuthenticatedContent from "./AuthenticatedContent";
import UnauthenticatedContent from "./UnauthenticatedContent";

const Header = () => {
  const { status, data } = useSession();

  const [menuIsOpen, setMenuIsOpen] = useState(false);

  useEffect(() => {
    if (menuIsOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuIsOpen]);

  const handleToggleMenu = () => setMenuIsOpen((prevState) => !prevState);

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const user = data?.user;

  return (
    <header
      className={clsx(
        "fixed z-50 flex w-full justify-end backdrop-blur-md",
        menuIsOpen &&
          "bg-background/75 inset-0 md:inset-auto md:bg-transparent",
      )}
    >
      {isLoading ? (
        <LoadingBar />
      ) : isAuthenticated && user ? (
        <AuthenticatedContent isOpen={menuIsOpen} user={data.user} />
      ) : (
        <UnauthenticatedContent isOpen={menuIsOpen} />
      )}

      <MenuButton
        isOpen={menuIsOpen}
        onClick={handleToggleMenu}
        className="absolute top-4 right-4 md:hidden"
      />
    </header>
  );
};

export default Header;

type CTAProps = ButtonProps & {
  isActive?: boolean;
};

export const CTA = ({ isActive, className, ...restProps }: CTAProps) => (
  <Button
    unstyled
    className={clsx(
      "hover:text-foreground/90 w-fit cursor-pointer font-semibold transition-colors duration-300",
      isActive && "text-primary hover:text-primary/90 pointer-events-none",
      className,
    )}
    disabled={isActive}
    {...restProps}
  />
);
