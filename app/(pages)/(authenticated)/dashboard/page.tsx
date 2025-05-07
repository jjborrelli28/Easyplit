import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DashboardPage = async () => {
  const token = (await cookies()).get("token")?.value;

  if (!token) redirect("/login");

  let userId: string;

  try {
    const payload = verifyToken(token);
    userId = payload.userId;
  } catch {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { alias: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Bienvenido, {user.alias}</p>
    </div>
  );
};

export default DashboardPage;
