import { useMutation } from "@tanstack/react-query";

import type {
    DeleteExpenseGroupFields,
    ErrorResponse,
    Expense,
    SuccessResponse,
} from "@/lib/api/types";
import api from "@/lib/axios";

const useDeleteExpense = () => {
    return useMutation<
        SuccessResponse<Expense>,
        ErrorResponse<DeleteExpenseGroupFields>,
        DeleteExpenseGroupFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.delete<SuccessResponse<Expense>>(
                "/expense",
                body,
            );

            return data;
        },
    });
};

export default useDeleteExpense;
