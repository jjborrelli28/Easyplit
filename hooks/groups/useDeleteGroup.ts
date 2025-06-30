import { useMutation } from "@tanstack/react-query";

import type {
    DeleteExpenseGroupFields,
    ErrorResponse,
    GroupData,
    SuccessResponse,
} from "@/lib/api/types";
import api from "@/lib/axios";

const useDeleteGroup = () => {
    return useMutation<
        SuccessResponse<GroupData>,
        ErrorResponse<DeleteExpenseGroupFields>,
        DeleteExpenseGroupFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.delete<SuccessResponse<GroupData>>(
                "/groups",
                body,
            );

            return data;
        },
    });
};

export default useDeleteGroup;
