import { useQuery } from "@tanstack/react-query";

import type { ExpenseHistory, User } from "@prisma/client";

import type { SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

export type ExpenseHistoryEntry = ExpenseHistory & {
  updatedBy: Pick<User, "id" | "name" | "email" | "image">;
};

const getExpenseHistory = async (expenseId?: string | null) => {
  const { data } = await api.get<SuccessResponse<ExpenseHistoryEntry[]>>(
    `/expense/${expenseId}/history`,
  );

  return data.data;
};

const useGetExpenseHistory = (expenseId?: string | null) => {
  return useQuery({
    queryKey: ["expense-history", expenseId],
    queryFn: () => getExpenseHistory(expenseId),
    enabled: !!expenseId,
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });
};

export default useGetExpenseHistory;
