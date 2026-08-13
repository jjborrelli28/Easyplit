import { useMutation } from "@tanstack/react-query";

import type { ErrorResponse, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const useAcceptInvitation = () => {
    return useMutation<SuccessResponse, ErrorResponse, string>({
        mutationFn: async (id) => {
            const { data } = await api.post<SuccessResponse>(
                `/invitation/${id}/accept`,
            );

            return data;
        },
    });
};

export default useAcceptInvitation;
