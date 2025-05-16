import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import PageContainer from "@/components/PageContainer";

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
    select: { name: true },
  });

  if (!user) redirect("/login");

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <p>Bienvenido, {user.name}</p>
    </PageContainer>
  );
};

export default DashboardPage;
