import { useMutation } from "@tanstack/react-query";

import type { Group } from "@prisma/client";

import type {
  ErrorResponse,
  GroupUpdateFieldErrors,
  SuccessResponse,
  UpdateGroupFields,
} from "@/lib/api/types";
import axios from "@/lib/axios";

const useUpdateGroup = (groupId?: string | null) => {
  return useMutation<
    SuccessResponse<Group>,
    ErrorResponse<GroupUpdateFieldErrors>,
    UpdateGroupFields
  >({
    mutationFn: async (body) => {
      const { data } = await axios.patch<SuccessResponse<Group>>(
        `/group/${groupId}`,
        body,
      );

      return data;
    },
  });
};

export default useUpdateGroup;
