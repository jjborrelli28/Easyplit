import { useMutation } from "@tanstack/react-query";

import type { AuthError, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

interface UpdateUserFields {
    id: string;
    name?: string;
    password?: string;
    currentPassword?: string;
}

const useUpdateUser = () => {
    return useMutation<
        SuccessResponse,
        AuthError<UpdateUserFields>,
        UpdateUserFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.post("/user", body);

            return data;
        },
    });
};

export default useUpdateUser;
