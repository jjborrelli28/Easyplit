import { useMutation } from "@tanstack/react-query";

import type {
    ErrorResponse,
    ForgotPasswordFields,
    SuccessResponse,
    UserData,
} from "@/lib/api/types";
import api from "@/lib/axios";

const useForgotPassword = () => {
    return useMutation<
        SuccessResponse<UserData>,
        ErrorResponse<ForgotPasswordFields>,
        ForgotPasswordFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.post<SuccessResponse<UserData>>(
                "/auth/forgot-password",
                body,
            );

            return data;
        },
    });
};

export default useForgotPassword;
