import { useMutation } from "@tanstack/react-query";

import type {
    ErrorResponse,
    ResetPasswordFields,
    SuccessResponse,
    User,
} from "@/lib/api/types";
import api from "@/lib/axios";

const useResetPassword = () => {
    return useMutation<
        SuccessResponse<User>,
        ErrorResponse<ResetPasswordFields>,
        ResetPasswordFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.post<SuccessResponse<User>>(
                "/auth/reset-password",
                body,
            );

            return data;
        },
    });
};

export default useResetPassword;
