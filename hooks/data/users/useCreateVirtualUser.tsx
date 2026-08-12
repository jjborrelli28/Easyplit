import { useMutation } from "@tanstack/react-query";

import type { AxiosError } from "axios";

import type {
    CreateVirtualUserFields,
    ServerErrorResponse,
    SuccessResponse,
    User,
} from "@/lib/api/types";
import api from "@/lib/axios";

const createVirtualUser = async (fields: CreateVirtualUserFields) => {
    const { data } = await api.post<SuccessResponse<User>>(
        "/virtual-user",
        fields,
    );

    return data.data!;
};

const useCreateVirtualUser = () => {
    return useMutation<
        User,
        AxiosError<ServerErrorResponse<CreateVirtualUserFields>>,
        CreateVirtualUserFields
    >({
        mutationFn: createVirtualUser,
    });
};

export default useCreateVirtualUser;
