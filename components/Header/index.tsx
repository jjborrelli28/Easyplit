"use client";

import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";

import clsx from "clsx";

import MenuButton from "../MenuButton";
import UnauthenticatedContent from "./UnauthenticatedContent";
import AuthenticatedContent from "./AuthenticatedContent";

const Header = () => {
  const { data, status } = useSession();

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

  const isAuthenticated = status === "authenticated";

  return (
    <header
      className={clsx(
        "fixed z-50 flex w-full justify-end backdrop-blur-md",
        menuIsOpen &&
          "bg-h-background/75 inset-0 md:inset-auto md:bg-transparent",
      )}
    >
      {isAuthenticated ? (
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
