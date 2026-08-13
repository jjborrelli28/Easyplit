import { useCallback } from "react";

import type { User } from "@/lib/api/types";

import useInviteUser from "./useInviteUser";

interface ResolveDraftUsersResult {
    resolvedUsers: User[];
    idMap: Map<string, string>;
}

const useResolveDraftUsers = () => {
    const { mutateAsync: inviteUser } = useInviteUser();

    const resolveDraftUsers = useCallback(
        async (
            users: User[],
            context?: string,
        ): Promise<ResolveDraftUsersResult> => {
            const idMap = new Map<string, string>();

            const resolvedUsers = await Promise.all(
                users.map(async (candidate) => {
                    if (!candidate.isDraft) return candidate;

                    const resolvedUser = await inviteUser({
                        name: candidate.name ?? "",
                        email: candidate.email ?? undefined,
                        context,
                    });

                    idMap.set(candidate.id, resolvedUser.id);

                    return resolvedUser;
                }),
            );

            return { resolvedUsers, idMap };
        },
        [inviteUser],
    );

    return resolveDraftUsers;
};

export default useResolveDraftUsers;
