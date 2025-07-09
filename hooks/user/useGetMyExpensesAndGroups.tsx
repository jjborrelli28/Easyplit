import { useQuery } from "@tanstack/react-query";

import type { Expense, Group } from "@prisma/client";

import type { SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const getMyExpensesAndGroups = async (userId?: string | null) => {
  const { data } = await api.get<
    SuccessResponse<{ groups: Group[]; expenses: Expense[] }>
  >("/user/groups-n-expenses", {
    params: { userId },
  });

  return data.data;
};

const useGetMyExpensesAndGroups = (userId?: string | null) => {
  return useQuery({
    queryKey: ["my-groups-and-expenses", userId],
    queryFn: () => getMyExpensesAndGroups(userId),
    enabled: !!userId,
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });
};

export default useGetMyExpensesAndGroups;
