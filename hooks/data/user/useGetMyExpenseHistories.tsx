import { useQuery } from "@tanstack/react-query";

import type { ExpenseHistory, User } from "@prisma/client";

import type { SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

export type MyExpenseHistoryEntry = ExpenseHistory & {
  updatedBy: Pick<User, "id" | "name" | "email" | "image">;
  expense: { id: string; name: string };
};

const getExpenseHistory = async () => {
  const { data } = await api.get<SuccessResponse<MyExpenseHistoryEntry[]>>(
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
