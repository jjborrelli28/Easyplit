import { useQuery } from "@tanstack/react-query";

import type { SuccessResponse, UserData } from "@/lib/api/types";
import api from "@/lib/axios";

const searchUsers = async (q: string, excludeUserIds?: string[]) => {
  const { data } = await api.get<SuccessResponse<UserData[]>>("/users/search", {
    params: {
      q,
      ...(excludeUserIds && excludeUserIds.length > 0
        ? { excludeUserIds: excludeUserIds.join(",") }
        : {}),
    },
  });

  return data.data;
};

const useSearchUsers = (q: string, excludeUserIds?: string[]) => {
  return useQuery({
    queryKey: ["search-users", q, ...(excludeUserIds ?? [])],
    queryFn: () => searchUsers(q, excludeUserIds),
    enabled: q.length >= 2,
    staleTime: 1000 * 10,
  });
};

export default useSearchUsers;
