import { useMutation } from "@tanstack/react-query";

import type { AuthError, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

interface DeleteUserFields {
    data: {
        id: string;
        password?: string;
    }
}

const useDeleteUser = () => {
    return useMutation<
        SuccessResponse,
        AuthError<DeleteUserFields>,
        DeleteUserFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.delete("/user", body);

            return data;
        },
    });
};

export default useDeleteUser;
