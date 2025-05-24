import { useMutation } from "@tanstack/react-query";

import type { AuthError, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

interface ForgotPasswordFields {
    email: string;
}

const useForgotPassword = () => {
    return useMutation<
        SuccessResponse,
        AuthError<ForgotPasswordFields>,
        ForgotPasswordFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.post("/auth/forgot-password", body);

            return data;
        },
    });
};

export default useForgotPassword;
