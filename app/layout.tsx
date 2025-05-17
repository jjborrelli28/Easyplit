import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import QueryClientProvider from "@/react-query/QueryClientProvider";
import ThemeProvider from "@/theme/ThemeProvider";

import Header from "@/components/Header";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Easyplit",
  description:
    "Easyplit te ayuda a dividir gastos con amigos, grupos o parejas de forma simple y rápida. Registrá, organizá y saldá cuentas sin complicaciones.",
};

const RootLayout = async ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <QueryClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />

            {children}
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
};

export default RootLayout;
