import { useQuery } from "@tanstack/react-query";

import { AxiosError } from "axios";

import api from "@/lib/axios";

import type { AuthUserResponse } from "@/app/(server)/api/auth/user/route";

interface AuthQueryData extends AuthUserResponse {
    isAuthtenticated: boolean;
}

export const useAuthQuery = () =>
    useQuery<AuthQueryData, AxiosError>({
        queryKey: ["auth"],
        queryFn: async () => {
            const { data } = await api.get<AuthUserResponse>("/auth/user");
            const user = data.user;

            return { isAuthtenticated: !!user, user };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false,
    });
