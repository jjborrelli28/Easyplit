import { useQuery } from "@tanstack/react-query";

import type { Expense, Group as PrismaGroup } from "@prisma/client";
import type { AxiosError } from "axios";

import type {
  GroupMember,
  ServerErrorResponse,
  SuccessResponse,
} from "@/lib/api/types";
import api from "@/lib/axios";

export interface Group extends PrismaGroup {
  expenses: Expense[];
  members: GroupMember[];
}

const searchGroups = async (q: string, userId: string | null) => {
  const { data } = await api.get<SuccessResponse<Group[]>>("/groups/search", {
    params: { q, userId },
  });

  return data.data ?? [];
};

const useSearchGroups = (q: string, userId?: string | null) => {
  return useQuery<Group[], AxiosError<ServerErrorResponse>>({
    queryKey: ["search-groups", q, userId],
    queryFn: () => searchGroups(q, userId!),
    enabled: !!userId && q.length >= 2,
    staleTime: 1000 * 10,
  });
};

export default useSearchGroups;
