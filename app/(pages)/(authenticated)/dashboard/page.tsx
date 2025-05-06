import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyToken } from "@/lib/auth";

const DashboardPage = async () => {
  const token = (await cookies()).get("token")?.value;

  if (!token) redirect("/login");

  try {
    const payload = verifyToken(token);
  } catch {
    redirect("/login");
  }

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Bienvenido a tu panel.</p>
    </div>
  );
};

export default DashboardPage;
