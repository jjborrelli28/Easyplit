import { useMutation } from '@tanstack/react-query';

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
    return useMutation<RegisterResponse, any, RegisterInput>({
        mutationFn: async (data) => {
            const response = await api.post('/auth/register', data);

            return response.data;
        },
    });
};

export default useRegister