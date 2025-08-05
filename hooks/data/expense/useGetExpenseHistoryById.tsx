import { useQuery } from "@tanstack/react-query";

import type { ExpenseHistory } from "@prisma/client";

import type { SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const getExpenseHistoryById = async (expenseId?: string | null) => {
  const { data } = await api.get<SuccessResponse<ExpenseHistory[]>>(
    `/expense/${expenseId}/history`,
  );

  return data.data;
};

const useGetExpenseHistoryById = (expenseId?: string | null) => {
  return useQuery({
    queryKey: ["expense-history", expenseId],
    queryFn: () => getExpenseHistoryById(expenseId),
    enabled: !!expenseId,
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });
};

export default useGetExpenseHistoryById;
