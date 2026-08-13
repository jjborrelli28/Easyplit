import { useMutation } from "@tanstack/react-query";

import type { ErrorResponse, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const useRejectInvitation = () => {
    return useMutation<SuccessResponse, ErrorResponse, string>({
        mutationFn: async (id) => {
            const { data } = await api.post<SuccessResponse>(
                `/invitation/${id}/reject`,
            );

            return data;
        },
    });
};

export default useRejectInvitation;
