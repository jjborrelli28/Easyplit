import { useMutation } from "@tanstack/react-query";

import type {
    DeleteUserFields,
    ErrorResponse,
    SuccessResponse,
    User,
} from "@/lib/api/types";
import api from "@/lib/axios";

const useDeleteUser = (userId?: string | null) => {
    return useMutation<
        SuccessResponse<User>,
        ErrorResponse<DeleteUserFields>,
        DeleteUserFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.delete<SuccessResponse<User>>(
                `/user/${userId}`,
                { data: body }
            );

            return data;
        },
    });
};

export default useDeleteUser;
