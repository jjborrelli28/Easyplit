import { useMutation } from "@tanstack/react-query";

import type {
    ErrorResponse,
    ResetPasswordFields,
    SuccessResponse,
    UserData,
} from "@/lib/api/types";
import api from "@/lib/axios";

const useResetPassword = () => {
    return useMutation<
        SuccessResponse<UserData>,
        ErrorResponse<ResetPasswordFields>,
        ResetPasswordFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.post<SuccessResponse<UserData>>(
                "/auth/reset-password",
                body,
            );

            return data;
        },
    });
};

export default useResetPassword;
