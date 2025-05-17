import { useMutation } from '@tanstack/react-query';

import api, { type AuthError } from '@/lib/axios';

interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

interface RegisterResponse {
    message: string;
}

const useRegister = () => {
    return useMutation<RegisterResponse, AuthError<RegisterInput>, RegisterInput>({
        mutationFn: async (data) => {
            const response = await api.post('/auth/register', data);

            return response.data;
        },
    });
};

export default useRegister