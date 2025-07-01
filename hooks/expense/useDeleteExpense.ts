import { useMutation } from "@tanstack/react-query";

import type {
    DeleteExpenseGroupFields,
    ErrorResponse,
    ExpenseData,
    SuccessResponse,
} from "@/lib/api/types";
import api from "@/lib/axios";

const useDeleteExpense = () => {
    return useMutation<
        SuccessResponse<ExpenseData>,
        ErrorResponse<DeleteExpenseGroupFields>,
        DeleteExpenseGroupFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.delete<SuccessResponse<ExpenseData>>(
                "/expense",
                body,
            );

            return data;
        },
    });
};

export default useDeleteExpense;
