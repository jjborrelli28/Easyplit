import { useQuery } from "@tanstack/react-query";

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
  });
};

export default useGetExpense;
