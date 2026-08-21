import { useMutation } from "@tanstack/react-query";

import type { ErrorResponse, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const useDeleteContact = () => {
    return useMutation<SuccessResponse, ErrorResponse, string>({
        mutationFn: async (contactUserId) => {
            const { data } = await api.delete<SuccessResponse>(
                `/user/contacts/${contactUserId}`,
            );

            return data;
        },
    });
};

export default useDeleteContact;
