import { useCallback } from "react";

import useSnackbar from "@/hooks/useSnackbar";

import type { User } from "@/lib/api/types";

import useInviteUser from "./useInviteUser";

interface ResolveDraftUsersResult {
    resolvedUsers: User[];
    idMap: Map<string, string>;
}

const useResolveDraftUsers = () => {
    const { mutateAsync: inviteUser } = useInviteUser();
    const { showSnackbar } = useSnackbar();

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

                    // Reaching a person outside your contacts by email is a
                    // request, not an instant add — this is the only signal
                    // the client gets about which draft was invited by email
                    // (the response itself stays generic on purpose).
                    if (candidate.email) {
                        showSnackbar("Solicitud de contacto enviada", {
                            color: "success",
                        });
                    }

                    return resolvedUser;
                }),
            );

            return { resolvedUsers, idMap };
        },
        [inviteUser, showSnackbar],
    );

    return resolveDraftUsers;
};

export default useResolveDraftUsers;
