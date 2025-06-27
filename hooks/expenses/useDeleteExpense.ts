import { useMutation } from "@tanstack/react-query";

import type {
    DeleteExpenseFields,
    ErrorResponse,
    ExpenseData,
    SuccessResponse,
} from "@/lib/api/types";
import api from "@/lib/axios";

const useDeleteExpense = () => {
    return useMutation<
        SuccessResponse<ExpenseData>,
        ErrorResponse<DeleteExpenseFields>,
        DeleteExpenseFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.delete<SuccessResponse<ExpenseData>>(
                "/expenses",
                body,
            );

            return data;
        },
    });
};

export default useDeleteExpense;
