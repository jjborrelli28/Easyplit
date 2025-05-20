"use client";

import { SessionProvider, type SessionProviderProps } from "next-auth/react";

const NextAuthProvider = ({ children, ...restProps }: SessionProviderProps) => {
  return <SessionProvider {...restProps}>{children}</SessionProvider>;
};

export default NextAuthProvider;
