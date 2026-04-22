import { useMutation } from "@tanstack/react-query";

import type { AxiosError } from "axios";

import type {
    ServerErrorResponse,
    SuccessResponse,
    User,
} from "@/lib/api/types";
import api from "@/lib/axios";

const createVirtualUser = async (name: string) => {
    const { data } = await api.post<SuccessResponse<User>>("/virtual-user", {
        name,
    });

    return data.data!;
};

const useCreateVirtualUser = () => {
    return useMutation<User, AxiosError<ServerErrorResponse>, string>({
        mutationFn: createVirtualUser,
    });
};

export default useCreateVirtualUser;
