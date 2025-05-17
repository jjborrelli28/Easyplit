import { useMutation } from "@tanstack/react-query";

import api, { type AuthError } from "@/lib/axios";

interface RegisterInput {
    email: string;
}

interface RegisterResponse {
    message: string;
}

const useForgotPassword = () => {
    return useMutation<RegisterResponse, AuthError<RegisterInput>, RegisterInput>(
        {
            mutationFn: async (data) => {
                const response = await api.post("/auth/forgot-password", data);

                return response.data;
            },
        },
    );
};

export default useForgotPassword;
