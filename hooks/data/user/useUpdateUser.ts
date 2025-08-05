import { useMutation } from "@tanstack/react-query";

import type {
    ErrorResponse,
    SuccessResponse,
    UpdateUserFields,
    User,
} from "@/lib/api/types";
import api from "@/lib/axios";

const useUpdateUser = (userId?: string | null) => {
    return useMutation<
        SuccessResponse<User>,
        ErrorResponse<UpdateUserFields>,
        UpdateUserFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.patch<SuccessResponse<User>>(`/user/${userId}`, body);

            return data;
        },
    });
};

export default useUpdateUser;
