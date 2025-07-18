import { useMutation } from "@tanstack/react-query";

import type { Expense } from "@prisma/client";

import type {
  ErrorResponse,
  ExpenseUpdateFieldErrors,
  SuccessResponse,
  UpdateExpenseFields,
} from "@/lib/api/types";
import axios from "@/lib/axios";

const useUpdateExpense = () => {
  return useMutation<
    SuccessResponse<Expense>,
    ErrorResponse<ExpenseUpdateFieldErrors>,
    UpdateExpenseFields
  >({
    mutationFn: async (body) => {
      const { data } = await axios.patch<SuccessResponse<Expense>>(
        "/expense",
        body,
      );

      return data;
    },
  });
};

export default useUpdateExpense;
