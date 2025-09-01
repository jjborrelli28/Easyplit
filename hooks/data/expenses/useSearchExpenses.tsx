import { useQuery } from "@tanstack/react-query";

import type { Expense as PrismaExpense } from "@prisma/client";
import type { AxiosError } from "axios";

import type {
  ExpenseParticipant,
  ServerErrorResponse,
  SuccessResponse,
} from "@/lib/api/types";
import api from "@/lib/axios";

export interface Expense extends PrismaExpense {
  participants: ExpenseParticipant[];
}

const searchExpenses = async (q: string) => {
  const { data } = await api.get<SuccessResponse<Expense[]>>(
    "/expenses/search",
    {
      params: { q },
    },
  );

  return data.data ?? [];
};

const useSearchExpenses = (q: string) => {
  return useQuery<Expense[], AxiosError<ServerErrorResponse>>({
    queryKey: ["search-expenses", q],
    queryFn: () => searchExpenses(q),
    enabled: q.length >= 2,
    staleTime: 1000 * 10,
  });
};

export default useSearchExpenses;
