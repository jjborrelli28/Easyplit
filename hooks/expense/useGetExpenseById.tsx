import { useQuery } from "@tanstack/react-query";

import type { ExpenseData, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const getLinkedExpenses = async (id?: string | null) => {
  const { data } = await api.get<SuccessResponse<ExpenseData>>("/expense", {
    params: { id },
  });

  return data.data;
};

const useGetExpenseById = (id?: string | null) => {
  return useQuery({
    queryKey: ["linked-expenses", id],
    queryFn: () => getLinkedExpenses(id),
    enabled: !!id,
    staleTime: 1000 * 10,
    refetchInterval: 3000,
  });
};

export default useGetExpenseById;
