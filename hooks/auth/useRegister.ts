import { useMutation } from '@tanstack/react-query';

import api, { type AuthError } from '@/lib/axios';

interface RegisterFields {
    name: string;
    email: string;
    password: string;
}

interface RegisterResponse {
    message: string;
}

const useRegister = () => {
    return useMutation<RegisterResponse, AuthError<RegisterFields>, RegisterFields>({
        mutationFn: async (body) => {
            const { data } = await api.post('/auth/register', body);

            return data;
        },
    });
};

export default useRegister