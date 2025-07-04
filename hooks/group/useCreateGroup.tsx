import { useMutation } from "@tanstack/react-query";

import type {
  CreateGroupFields,
  ErrorResponse,
  Group,
  SuccessResponse,
} from "@/lib/api/types";
import axios from "@/lib/axios";

interface FieldErrorsCreateGroup extends Omit<CreateGroupFields, "memberIds"> {
  memberIds: string;
}

const useCreateGroup = () => {
  return useMutation<
    SuccessResponse<Group>,
    ErrorResponse<FieldErrorsCreateGroup>,
    CreateGroupFields
  >({
    mutationFn: async (body) => {
      const { data } = await axios.post<SuccessResponse<Group>>(
        "/groups",
        body,
      );

      return data;
    },
  });
};

export default useCreateGroup;
