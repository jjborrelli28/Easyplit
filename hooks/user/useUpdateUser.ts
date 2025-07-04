import { useMutation } from "@tanstack/react-query";

import type {
    ErrorResponse,
    SuccessResponse,
    UpdateUserFields,
    User,
} from "@/lib/api/types";
import api from "@/lib/axios";

const useUpdateUser = () => {
    return useMutation<
        SuccessResponse<User>,
        ErrorResponse<UpdateUserFields>,
        UpdateUserFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.post<SuccessResponse<User>>("/user", body);

            return data;
        },
    });
};

export default useUpdateUser;
