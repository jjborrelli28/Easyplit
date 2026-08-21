import { useQuery } from "@tanstack/react-query";

import type { ContactsResponse, SuccessResponse } from "@/lib/api/types";
import api from "@/lib/axios";

const getContacts = async () => {
    const { data } =
        await api.get<SuccessResponse<ContactsResponse>>("/user/contacts");

    return data.data;
};

const useGetContacts = () => {
    return useQuery({
        queryKey: ["contacts"],
        queryFn: () => getContacts(),
        staleTime: 1000 * 10,
    });
};

export default useGetContacts;
