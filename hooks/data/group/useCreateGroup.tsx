import { useMutation } from "@tanstack/react-query";

import type { Group } from "@prisma/client";

import type {
  CreateGroupFields,
  ErrorResponse,
  GroupCreationFieldErrors,
  SuccessResponse,
} from "@/lib/api/types";
import axios from "@/lib/axios";

const useCreateGroup = () => {
  return useMutation<
    SuccessResponse<Group>,
    ErrorResponse<GroupCreationFieldErrors>,
    CreateGroupFields
  >({
    mutationFn: async (body) => {
      const { data } = await axios.post<SuccessResponse<Group>>("/group", body);

      return data;
    },
  });
};

export default useCreateGroup;
