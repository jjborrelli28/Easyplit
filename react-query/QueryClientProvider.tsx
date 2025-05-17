"use client";

import {
  QueryClient,
  type QueryClientProviderProps,
  QueryClientProvider as ReactQueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

const QueryClientProvider = ({
  children,
  ...restProps
}: Omit<QueryClientProviderProps, "client">) => {
  return (
    <ReactQueryClientProvider client={queryClient} {...restProps}>
      {children}
    </ReactQueryClientProvider>
  );
};

export default QueryClientProvider;
