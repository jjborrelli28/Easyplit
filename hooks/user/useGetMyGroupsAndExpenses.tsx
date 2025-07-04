import { useQuery } from "@tanstack/react-query";

import type { Expense, Group, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const getMyGroupsAndExpenses = async (userId?: string | null) => {
  const { data } = await api.get<
    SuccessResponse<{ groups: Group[]; expenses: Expense[] }>
  >("/user/groups-n-expenses", {
    params: { userId },
  });

  return data.data;
};

const useGetMyGroupsAndExpenses = (userId?: string | null) => {
  return useQuery({
    queryKey: ["my-groups-and-expenses", userId],
    queryFn: () => getMyGroupsAndExpenses(userId),
    enabled: !!userId,
    staleTime: 1000 * 10,
    refetchInterval: 3000,
  });
};

export default useGetMyGroupsAndExpenses;
