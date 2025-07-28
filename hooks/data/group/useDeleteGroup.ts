import { useMutation } from "@tanstack/react-query";

import type {
    DeleteExpenseGroupFields,
    ErrorResponse,
    Group,
    SuccessResponse,
} from "@/lib/api/types";
import api from "@/lib/axios";

const useDeleteGroup = () => {
    return useMutation<
        SuccessResponse<Group>,
        ErrorResponse<DeleteExpenseGroupFields>,
        DeleteExpenseGroupFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.delete<SuccessResponse<Group>>(
                "/group",
                body,
            );

            return data;
        },
    });
};

export default useDeleteGroup;
