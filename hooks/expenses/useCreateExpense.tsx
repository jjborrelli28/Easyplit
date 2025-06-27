import { useMutation } from "@tanstack/react-query";

import type {
  CreateExpenseFields,
  ErrorResponse,
  ExpenseData,
  SuccessResponse,
} from "@/lib/api/types";
import axios from "@/lib/axios";

const useCreateExpense = () => {
  return useMutation<
    SuccessResponse<ExpenseData>,
    ErrorResponse<CreateExpenseFields>,
    CreateExpenseFields
  >({
    mutationFn: async (body) => {
      const { data } = await axios.post<SuccessResponse<ExpenseData>>(
        "/expenses",
        body,
      );

      return data;
    },
  });
};

export default useCreateExpense;
