import { useMutation } from "@tanstack/react-query";

import type {
  CreateExpenseFields,
  ErrorResponse,
  ExpenseData,
  SuccessResponse,
} from "@/lib/api/types";
import axios from "@/lib/axios";

interface FieldErrorsCreateExpense
  extends Omit<CreateExpenseFields, "amount" | "participantIds"> {
  amount: string;
  participantIds: string;
}

const useCreateExpense = () => {
  return useMutation<
    SuccessResponse<ExpenseData>,
    ErrorResponse<FieldErrorsCreateExpense>,
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
