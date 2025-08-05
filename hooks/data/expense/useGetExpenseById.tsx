import { useQuery } from "@tanstack/react-query";

import type { Expense } from "@prisma/client";

import type { SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const getExpenseById = async (expenseId?: string | null) => {
  const { data } = await api.get<SuccessResponse<Expense>>(
    `/expense/${expenseId}`,
  );

  return data.data;
};

const useGetExpenseById = (expenseId?: string | null) => {
  return useQuery({
    queryKey: ["linked-expense", expenseId],
    queryFn: () => getExpenseById(expenseId),
    enabled: !!expenseId,
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });
};

export default useGetExpenseById;
