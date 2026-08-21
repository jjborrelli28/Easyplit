import { useQuery } from "@tanstack/react-query";

import type { GroupHistory, User } from "@prisma/client";

import type { SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

export type MyGroupHistoryEntry = GroupHistory & {
  updatedBy: Pick<User, "id" | "name" | "email" | "image">;
  group: { id: string; name: string };
  removedMemberName?: string | null;
  removedMemberIsVirtual?: boolean;
};

const getMyGroupHistories = async () => {
  const { data } = await api.get<SuccessResponse<MyGroupHistoryEntry[]>>(
    `/user/group-histories`,
  );

  return data.data;
};

const useGetMyGroupHistories = () => {
  return useQuery({
    queryKey: ["my-group-histories"],
    queryFn: () => getMyGroupHistories(),
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });
};

export default useGetMyGroupHistories;
