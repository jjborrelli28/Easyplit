import { useMutation } from "@tanstack/react-query";

import type { AuthError, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

interface ResetPasswordFields {
    password: string;
}

const useResetPassword = () => {
    return useMutation<
        SuccessResponse,
        AuthError<ResetPasswordFields>,
        ResetPasswordFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.post("/auth/reset-password", body);

            return data;
        },
    });
};

export default useResetPassword;
