import { useQuery } from "@tanstack/react-query";

import type { ExpenseData, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const getLinkedExpenses = async (userId?: string | null) => {
  const { data } = await api.get<SuccessResponse<ExpenseData[]>>("/expenses", {
    params: { userId },
  });

  return data.data;
};

const useGetLinkedExpenses = (userId?: string | null) => {
  return useQuery({
    queryKey: ["linked-expenses", userId],
    queryFn: () => getLinkedExpenses(userId),
    enabled: !!userId,
    staleTime: 1000 * 10,
    refetchInterval: 3000,
  });
};

export default useGetLinkedExpenses;
