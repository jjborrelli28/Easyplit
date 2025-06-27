import { useQuery } from "@tanstack/react-query";

import type { GroupData, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const getLinkedGroups = async (userId?: string | null) => {
  const { data } = await api.get<SuccessResponse<GroupData[]>>("/groups", {
    params: { userId },
  });

  return data.data;
};

const useGetLinkedGroups = (userId?: string | null) => {
  return useQuery({
    queryKey: ["linked-groups", userId],
    queryFn: () => getLinkedGroups(userId),
    enabled: !!userId,
    staleTime: 1000 * 10,
  });
};

export default useGetLinkedGroups;
