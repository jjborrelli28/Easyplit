import { useMutation } from "@tanstack/react-query";

import api, { type AuthError } from '@/lib/axios';

interface LoginInput {
    email: string;
    password: string;
}

interface LoginResponse {
    message: string;
}

const useLogin = () => {
    return useMutation<LoginResponse, AuthError<LoginInput>, LoginInput>({
        mutationFn: async (data) => {
            const res = await api.post("/auth/login", data);

            return res.data;
        },
    });
}

export default useLogin
