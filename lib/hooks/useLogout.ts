import { useMutation, useQueryClient } from "@tanstack/react-query";

import api, { type AuthError } from "@/lib/axios";

interface LoginResponse {
    message: string;
}

const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation<LoginResponse, AuthError<{ error: string }>, void>({
        mutationFn: async () => {
            const res = await api.post("/auth/logout");

            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth"] });
        },
    });
};

export default useLogout;
