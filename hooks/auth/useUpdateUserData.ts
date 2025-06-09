import { useMutation } from "@tanstack/react-query";

import type { AuthError, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

interface UpdateUserDataFields {
    name?: string;
    password?: string;
    currentPassword?: string;
    email: string;
}

const useUpdateUserData = () => {
    return useMutation<
        SuccessResponse,
        AuthError<UpdateUserDataFields>,
        UpdateUserDataFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.post("/user", body);

            return data;
        },
    });
};

export default useUpdateUserData;
