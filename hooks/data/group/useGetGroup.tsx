import { useQuery } from "@tanstack/react-query";

import type { Group, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const getGroup = async (groupId?: string | null) => {
  const { data } = await api.get<SuccessResponse<Group>>(`/group/${groupId}`);

  return data.data;
};

const useGetGroup = (groupId?: string | null) => {
  return useQuery({
    queryKey: ["group", groupId],
    queryFn: () => getGroup(groupId),
    enabled: !!groupId,
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });
};

export default useGetGroup;
