import { useMutation } from "@tanstack/react-query";

import type {
    DeleteUserFields,
    ErrorResponse,
    SuccessResponse,
    UserData,
} from "@/lib/api/types";
import api from "@/lib/axios";

const useDeleteUser = () => {
    return useMutation<
        SuccessResponse<UserData>,
        ErrorResponse<DeleteUserFields>,
        DeleteUserFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.delete<SuccessResponse<UserData>>(
                "/user",
                { data: body }
            );

            return data;
        },
    });
};

export default useDeleteUser;
