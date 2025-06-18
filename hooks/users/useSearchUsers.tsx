import { useQuery } from "@tanstack/react-query";

import type { SuccessResponse, UserData } from "@/lib/api/types";
import api from "@/lib/axios";

const searchUsers = async (q: string, excludeUserId?: string | null) => {
  const { data } = await api.get<SuccessResponse<UserData[]>>("/users/search", {
    params: { q, ...(excludeUserId ? { excludeUserId } : {}) },
  });

  return data.data;
};

export const useSearchUsers = (q: string, excludeUserId?: string | null) => {
  return useQuery({
    queryKey: ["search-users", q, excludeUserId],
    queryFn: () => searchUsers(q, excludeUserId),
    enabled: q.length >= 2,
    staleTime: 1000 * 10,
  });
};
