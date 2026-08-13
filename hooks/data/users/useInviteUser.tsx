import { useMutation } from "@tanstack/react-query";

import type { AxiosError } from "axios";

import type {
    InviteUserFields,
    ServerErrorResponse,
    SuccessResponse,
    User,
} from "@/lib/api/types";
import api from "@/lib/axios";

const inviteUser = async (fields: InviteUserFields) => {
    const { data } = await api.post<SuccessResponse<User>>("/invite", fields);

    return data.data!;
};

const useInviteUser = () => {
    return useMutation<
        User,
        AxiosError<ServerErrorResponse<InviteUserFields>>,
        InviteUserFields
    >({
        mutationFn: inviteUser,
    });
};

export default useInviteUser;
