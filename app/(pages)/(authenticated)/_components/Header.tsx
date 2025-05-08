"use client";

import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <header className="justify-end bg-gray-900 p-4">
      <nav className="container flex justify-end">
        <button onClick={logout} className="btn">
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Header;
