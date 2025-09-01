import { useMutation } from "@tanstack/react-query";

import type { Group } from "@prisma/client";

import type { ErrorResponse, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const useDeleteGroup = (groupId?: string | null) => {
    return useMutation<SuccessResponse<Group>, ErrorResponse>({
        mutationFn: async () => {
            const { data } = await api.delete<SuccessResponse<Group>>(
                `/group/${groupId}`,
            );

            return data;
        },
    });
};

export default useDeleteGroup;
