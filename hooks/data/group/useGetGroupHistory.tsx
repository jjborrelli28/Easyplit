import { useQuery } from "@tanstack/react-query";

import type { GroupHistory } from "@prisma/client";

import type { SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const getGroupHistory = async (groupId?: string | null) => {
  const { data } = await api.get<SuccessResponse<GroupHistory[]>>(
    `/group/${groupId}/history`,
  );

  return data.data;
};

const useGetGroupHistory = (groupId?: string | null) => {
  return useQuery({
    queryKey: ["expense-history", groupId],
    queryFn: () => getGroupHistory(groupId),
    enabled: !!groupId,
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });
};

export default useGetGroupHistory;
