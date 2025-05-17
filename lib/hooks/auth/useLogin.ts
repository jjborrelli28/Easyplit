import { useMutation, useQueryClient } from "@tanstack/react-query";

import api, { type AuthError } from "@/lib/axios";

interface LoginInput {
    email: string;
    password: string;
}

interface LoginResponse {
    message: string;
}

const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation<LoginResponse, AuthError<LoginInput>, LoginInput>({
        mutationFn: async (data) => {
            const res = await api.post("/auth/login", data);

            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth"] });
        },
    });
};

export default useLogin;

