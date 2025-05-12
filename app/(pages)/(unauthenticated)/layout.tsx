"use client";

import { type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Header from "./_components/Header";

const queryClient = new QueryClient();

const UnauthenticatedLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      {children}
    </QueryClientProvider>
  );
};

export default UnauthenticatedLayout;
