"use client";

import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Bienvenido a tu panel.</p>
      <button onClick={logout} className="btn mt-4">
        Logout
      </button>
    </div>
  );
}
