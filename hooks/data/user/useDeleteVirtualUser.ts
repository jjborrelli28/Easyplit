import { useMutation } from "@tanstack/react-query";

import type { ErrorResponse, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const useDeleteVirtualUser = () => {
    return useMutation<SuccessResponse, ErrorResponse, string>({
        mutationFn: async (virtualUserId) => {
            const { data } = await api.delete<SuccessResponse>(
                `/user/virtual-users/${virtualUserId}`,
            );

            return data;
        },
    });
};

export default useDeleteVirtualUser;
