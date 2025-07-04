import { useMutation } from "@tanstack/react-query";

import type {
    ErrorResponse,
    RegisterFields,
    SuccessResponse,
    User,
} from "@/lib/api/types";
import api from "@/lib/axios";

const useRegister = () => {
    return useMutation<
        SuccessResponse<User>,
        ErrorResponse<RegisterFields>,
        RegisterFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.post<SuccessResponse<User>>(
                "/auth/register",
                body,
            );

            return data;
        },
    });
};

export default useRegister;
