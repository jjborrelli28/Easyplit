import { useMutation } from "@tanstack/react-query";

import api, { type AuthError } from "@/lib/axios";

interface RegisterInput {
    password: string;
}

interface RegisterResponse {
    message: string;
}

const useResetPassword = () => {
    return useMutation<RegisterResponse, AuthError<RegisterInput>, RegisterInput>(
        {
            mutationFn: async (data) => {
                const response = await api.post("/auth/reset-password", data);

                return response.data;
            },
        },
    );
};

export default useResetPassword;
