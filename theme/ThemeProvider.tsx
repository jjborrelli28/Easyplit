"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

const ThemeProvider = ({ children, ...restProps }: ThemeProviderProps) => {
  return <NextThemesProvider {...restProps}>{children}</NextThemesProvider>;
};

export default ThemeProvider;
