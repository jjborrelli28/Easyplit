import { useMutation } from "@tanstack/react-query";

import type {
  CreateGroupFields,
  ErrorResponse,
  GroupData,
  SuccessResponse,
} from "@/lib/api/types";
import axios from "@/lib/axios";

interface FieldErrorsCreateGroup extends Omit<CreateGroupFields, "memberIds"> {
  memberIds: string;
}

const useCreateGroup = () => {
  return useMutation<
    SuccessResponse<GroupData>,
    ErrorResponse<FieldErrorsCreateGroup>,
    CreateGroupFields
  >({
    mutationFn: async (body) => {
      const { data } = await axios.post<SuccessResponse<GroupData>>(
        "/groups",
        body,
      );

      return data;
    },
  });
};

export default useCreateGroup;
