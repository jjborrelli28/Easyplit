
import { useMutation } from "@tanstack/react-query";

import type { AxiosError } from "axios";

import api from '@/lib/axios';

interface LoginInput {
    email: string;
    password: string;
}

interface LoginResponse {
    message: string;
}

const useLogin = () => {
    return useMutation<LoginResponse, AxiosError, LoginInput>({
        mutationFn: async (data) => {
            const res = await api.post("/auth/login", data);

            return res.data;
        },
    });
}

export default useLogin
