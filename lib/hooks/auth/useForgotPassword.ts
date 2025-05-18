import { useMutation } from "@tanstack/react-query";

import api, { type AuthError } from "@/lib/axios";

interface ForgotPasswordFields {
    email: string;
}

interface ForgotPasswordResponse {
    message: string;
}

const useForgotPassword = () => {
    return useMutation<
        ForgotPasswordResponse,
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
