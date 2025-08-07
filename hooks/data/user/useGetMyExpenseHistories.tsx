import { useQuery } from "@tanstack/react-query";

import type { ExpenseHistory } from "@prisma/client";

import type { SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const getExpenseHistory = async () => {
  const { data } = await api.get<SuccessResponse<ExpenseHistory[]>>(
    `/user/expense-histories`,
  );

  return data.data;
};

const useGetMyExpenseHistories = () => {
  return useQuery({
    queryKey: ["my-expense-histories"],
    queryFn: () => getExpenseHistory(),
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });
};

export default useGetMyExpenseHistories;
