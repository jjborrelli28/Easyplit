"use client";

import { useSession } from "next-auth/react";

import PageContainer from "@/components/PageContainer";

const DashboardPage = () => {
  const { data } = useSession();
  console.log(data);
  return (
    <PageContainer>
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <p>Bienvenido, {data?.user?.name}</p>
    </PageContainer>
  );
};

export default DashboardPage;
