import { useMutation } from '@tanstack/react-query';

import type { AxiosError } from "axios";

import api from '@/lib/axios';

interface RegisterInput {
    alias: string;
    email: string;
    password: string;
}

interface RegisterResponse {
    message: string;
}

const useRegister = () => {
    return useMutation<RegisterResponse, AxiosError, RegisterInput>({
        mutationFn: async (data) => {
            const response = await api.post('/auth/register', data);

            return response.data;
        },
    });
};

export default useRegister