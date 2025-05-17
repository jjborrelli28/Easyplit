import { useMutation, useQueryClient } from "@tanstack/react-query";

import api, { type AuthError } from "@/lib/axios";

interface LoginFields {
    email: string;
    password: string;
}

interface LoginResponse {
    message: string;
}

const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation<LoginResponse, AuthError<LoginFields>, LoginFields>({
        mutationFn: async (body) => {
            const { data } = await api.post("/auth/login", body);

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth"] });
        },
    });
};

export default useLogin;
