"use client";

import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <header className="bg-gray-900 justify-end p-4">
      <nav className="container flex justify-end">
        <button onClick={logout} className="btn">
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Header;
