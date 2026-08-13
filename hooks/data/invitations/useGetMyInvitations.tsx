import { useQuery } from "@tanstack/react-query";

import type { PendingInvitation, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const getMyInvitations = async () => {
    const { data } = await api.get<SuccessResponse<PendingInvitation[]>>(
        "/invitation",
    );

    return data.data ?? [];
};

const useGetMyInvitations = () => {
    return useQuery({
        queryKey: ["my-invitations"],
        queryFn: () => getMyInvitations(),
        staleTime: 1000 * 10,
        refetchInterval: 10000,
    });
};

export default useGetMyInvitations;
