import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";

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
    // 4xx responses (no access, doesn't exist) won't change on retry — only
    // keep retrying transient/server errors, so the page's not-found state
    // doesn't sit behind a several-second retry backoff.
    retry: (failureCount, error) => {
      const status = (error as AxiosError)?.response?.status;

      if (status && status >= 400 && status < 500) return false;

      return failureCount < 3;
    },
  });
};

export default useGetGroup;
