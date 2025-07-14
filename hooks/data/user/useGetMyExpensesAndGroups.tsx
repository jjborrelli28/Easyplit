import { useQuery } from "@tanstack/react-query";

import type { Expense, Group, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const getMyExpensesAndGroups = async (userId?: string | null) => {
  const { data } = await api.get<
    SuccessResponse<{ expenses: Expense[]; groups: Group[] }>
  >("/user/expenses-groups", {
    params: { userId },
  });

  return data.data;
};

const useGetMyExpensesAndGroups = (userId?: string | null) => {
  return useQuery({
    queryKey: ["my-expenses-and-groups", userId],
    queryFn: () => getMyExpensesAndGroups(userId),
    enabled: !!userId,
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });
};

export default useGetMyExpensesAndGroups;
