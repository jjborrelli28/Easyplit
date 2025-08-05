import { useMutation } from "@tanstack/react-query";

import type { Expense } from "@prisma/client";

import type { ErrorResponse, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const useDeleteExpense = (expenseId?: string | null) => {
    return useMutation<SuccessResponse<Expense>, ErrorResponse>({
        mutationFn: async () => {
            const { data } = await api.delete<SuccessResponse<Expense>>(
                `/expense/${expenseId}`,
            );

            return data;
        },
    });
};

export default useDeleteExpense;
