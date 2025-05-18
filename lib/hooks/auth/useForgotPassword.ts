import { useMutation } from "@tanstack/react-query";

import api, { type AuthError } from "@/lib/axios";

interface RegisterFields {
    email: string;
}

interface RegisterResponse {
    message: string;
}

const useForgotPassword = () => {
    return useMutation<
        RegisterResponse,
        AuthError<RegisterFields>,
        RegisterFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.post("/auth/forgot-password", body);

            return data;
        },
    });
};

export default useForgotPassword;
