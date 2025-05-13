import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import ThemeInitializer from "@/components/ThemeInitializer";
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

const RootLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <html lang="es">
      <body className={`${inter.variable} antialiased`}>
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
