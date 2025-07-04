import { useMutation } from "@tanstack/react-query";

import type {
    ErrorResponse,
    ForgotPasswordFields,
    SuccessResponse,
    User,
} from "@/lib/api/types";
import api from "@/lib/axios";

const useForgotPassword = () => {
    return useMutation<
        SuccessResponse<User>,
        ErrorResponse<ForgotPasswordFields>,
        ForgotPasswordFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.post<SuccessResponse<User>>(
                "/auth/forgot-password",
                body,
            );

            return data;
        },
    });
};

export default useForgotPassword;
