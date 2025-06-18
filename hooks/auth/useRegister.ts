import { useMutation } from "@tanstack/react-query";

import type {
    ErrorResponse,
    RegisterFields,
    SuccessResponse,
    UserData,
} from "@/lib/api/types";
import api from "@/lib/axios";

const useRegister = () => {
    return useMutation<
        SuccessResponse<UserData>,
        ErrorResponse<RegisterFields>,
        RegisterFields
    >({
        mutationFn: async (body) => {
            const { data } = await api.post<SuccessResponse<UserData>>(
                "/auth/register",
                body,
            );

            return data;
        },
    });
};

export default useRegister;
