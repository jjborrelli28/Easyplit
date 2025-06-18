import { useMutation } from "@tanstack/react-query";

import type {
    ErrorResponse,
    SuccessResponse,
    UpdateUserFields,
    UserData,
} from "@/lib/api/types";
import api from "@/lib/axios";

const useUpdateUser = () => {
    return useMutation<
        SuccessResponse<UserData>,
        ErrorResponse<UpdateUserFields>,
        UpdateUserFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.post<SuccessResponse<UserData>>("/user", body);

            return data;
        },
    });
};

export default useUpdateUser;
