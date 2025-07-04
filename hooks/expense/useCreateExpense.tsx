import { useMutation } from "@tanstack/react-query";

import type {
  CreateExpenseFields,
  ErrorResponse,
  Expense,
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
    SuccessResponse<Expense>,
    ErrorResponse<FieldErrorsCreateExpense>,
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
