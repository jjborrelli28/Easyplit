import { useMutation } from "@tanstack/react-query";

import type { Expense } from "@prisma/client";

import type {
  CreateExpenseFields,
  ErrorResponse,
  ExpenseCreationFieldErrors,
  SuccessResponse,
} from "@/lib/api/types";
import axios from "@/lib/axios";

const useCreateExpense = () => {
  return useMutation<
    SuccessResponse<Expense>,
    ErrorResponse<ExpenseCreationFieldErrors>,
    CreateExpenseFields
  >({
    mutationFn: async (body) => {
      const { data } = await axios.post<SuccessResponse<Expense>>(
        "/expense",
        body,
      );

      return data;
    },
  });
};

export default useCreateExpense;
