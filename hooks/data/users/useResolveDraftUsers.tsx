import { useCallback } from "react";

import type { User } from "@/lib/api/types";

import useCreateVirtualUser from "./useCreateVirtualUser";

interface ResolveDraftUsersResult {
    resolvedUsers: User[];
    idMap: Map<string, string>;
}

const useResolveDraftUsers = () => {
    const { mutateAsync: createVirtualUser } = useCreateVirtualUser();

    const resolveDraftUsers = useCallback(
        async (
            users: User[],
            context?: string,
        ): Promise<ResolveDraftUsersResult> => {
            const idMap = new Map<string, string>();

            const resolvedUsers = await Promise.all(
                users.map(async (candidate) => {
                    if (!candidate.isDraft) return candidate;

                    const createdUser = await createVirtualUser({
                        name: candidate.name ?? "",
                        email: candidate.email ?? undefined,
                        context,
                    });

                    idMap.set(candidate.id, createdUser.id);

                    return createdUser;
                }),
            );

            return { resolvedUsers, idMap };
        },
        [createVirtualUser],
    );

    return resolveDraftUsers;
};

export default useResolveDraftUsers;
