import { useQuery } from "@tanstack/react-query";

import type { Expense, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const getLinkedExpenses = async (id?: string | null) => {
  const { data } = await api.get<SuccessResponse<Expense>>("/expense", {
    params: { id },
  });

  return data.data;
};

const useGetExpenseById = (id?: string | null) => {
  return useQuery({
    queryKey: ["linked-expense", id],
    queryFn: () => getLinkedExpenses(id),
    enabled: !!id,
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });
};

export default useGetExpenseById;
