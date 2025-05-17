import { useQuery } from "@tanstack/react-query";

import axios from "axios";

export const useAuthQuery = () =>
    useQuery({
        queryKey: ["auth"],
        queryFn: async () => {
            const { data } = await axios.get("/api/me");

            return data.user;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false,
    });
