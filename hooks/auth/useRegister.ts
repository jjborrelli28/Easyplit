import { useMutation } from "@tanstack/react-query";

import api from "@/lib/axios";
import type { AuthError, SuccessResponse } from "@/lib/api/types";

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
