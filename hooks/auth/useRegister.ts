import { useMutation } from "@tanstack/react-query";

import type { AuthError, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

interface RegisterFields {
    name: string;
    email: string;
    password: string;
}

const useRegister = () => {
    return useMutation<
        SuccessResponse,
        AuthError<RegisterFields>,
        RegisterFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.post("/auth/register", body);

            return data;
        },
    });
};

export default useRegister;
