import { useMutation } from "@tanstack/react-query";

import type { ErrorResponse, SuccessResponse } from "@/lib/api/types";
import axios from "@/lib/axios";

interface CreateGroupInput {
  name: string;
  createdById: string;
  memberIds: string[];
}

interface Group {
  id: string;
  name: string;
  createdAt: string;
  createdById: string;
  members: {
    id: string;
    userId: string;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  }[];
}

const useCreateGroup = () => {
  return useMutation<
    SuccessResponse,
    ErrorResponse<CreateGroupInput>,
    CreateGroupInput
  >({
    mutationFn: async (body) => {
      const { data } = await axios.post("/groups", body);

      return data;
    },
  });
};

export default useCreateGroup;
