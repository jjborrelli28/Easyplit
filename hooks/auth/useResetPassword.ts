import { useMutation } from "@tanstack/react-query";

import api, { type AuthError } from "@/lib/axios";

interface ResetPasswordFields {
    password: string;
}

interface ResetPasswordResponse {
    message: string;
}

const useResetPassword = () => {
    return useMutation<ResetPasswordResponse, AuthError<ResetPasswordFields>, ResetPasswordFields>(
        {
            mutationFn: async (body) => {
                const { data } = await api.post("/auth/reset-password", body);

                return data;
            },
        },
    );
};

export default useResetPassword;
