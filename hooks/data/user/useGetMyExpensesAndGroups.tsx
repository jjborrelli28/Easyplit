import { useQuery } from "@tanstack/react-query";

import type { Expense, Group, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const getMyExpensesAndGroups = async () => {
  const { data } = await api.get<
    SuccessResponse<{ expenses: Expense[]; groups: Group[] }>
  >(`/user/expenses-groups`);

  return data.data;
};

const useGetMyExpensesAndGroups = () => {
  return useQuery({
    queryKey: ["my-expenses-and-groups"],
    queryFn: () => getMyExpensesAndGroups(),
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });
};

export default useGetMyExpensesAndGroups;
