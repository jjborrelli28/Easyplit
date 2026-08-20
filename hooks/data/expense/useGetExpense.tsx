import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import type { Expense, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const getExpense = async (expenseId?: string | null) => {
  const { data } = await api.get<SuccessResponse<Expense>>(
    `/expense/${expenseId}`,
  );

  return data.data;
};

const useGetExpense = (expenseId?: string | null) => {
  return useQuery({
    queryKey: ["expense", expenseId],
    queryFn: () => getExpense(expenseId),
    enabled: !!expenseId,
    staleTime: 1000 * 10,
    refetchInterval: 10000,
    // 4xx responses (no access, doesn't exist) won't change on retry — only
    // keep retrying transient/server errors, so the page's not-found state
    // doesn't sit behind a several-second retry backoff.
    retry: (failureCount, error) => {
      const status = (error as AxiosError)?.response?.status;

      if (status && status >= 400 && status < 500) return false;

      return failureCount < 3;
    },
  });
};

export default useGetExpense;
