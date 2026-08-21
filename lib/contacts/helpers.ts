import prisma from "@/lib/prisma";

/**
 * Records that every pair of real users among `userIds` has shared a group
 * or expense, so they stay discoverable in each other's search even after
 * that group/expense is deleted or they stop sharing anything active.
 *
 * `reactivate` controls what happens when a pair's Contact row already
 * exists but was soft-removed (`removed: true`, see schema.prisma):
 * - false (default): leave it alone via `skipDuplicates`. Used by the four
 *   call sites that resync contacts off a group/expense's *current* member
 *   list on every unrelated membership edit — none of those represent a
 *   real consent event, so a removed pair must not silently come back.
 * - true: explicitly clear `removed`. Used only by `syncContactsForUser`,
 *   which itself only runs right after a genuine invite-accept/register
 *   merge — the one moment reactivating a removed pair is actually correct.
 */
export const upsertContactsForRealUserIds = async (
    userIds: string[],
    opts: { reactivate?: boolean } = {},
) => {
    const uniqueIds = Array.from(new Set(userIds));

    if (uniqueIds.length < 2) return;

    const realUsers = await prisma.user.findMany({
        where: { id: { in: uniqueIds }, isVirtual: false },
        select: { id: true },
    });
    const realIds = realUsers.map((u) => u.id);

    if (realIds.length < 2) return;

    const pairs = realIds.flatMap((a) =>
        realIds
            .filter((b) => b !== a)
            .map((b) => ({ userId: a, contactUserId: b })),
    );

    if (opts.reactivate) {
        await Promise.all(
            pairs.map(({ userId, contactUserId }) =>
                prisma.contact.upsert({
                    where: { userId_contactUserId: { userId, contactUserId } },
                    update: { removed: false },
                    create: { userId, contactUserId },
                }),
            ),
        );

        return;
    }

    await prisma.contact.createMany({ data: pairs, skipDuplicates: true });
};

/**
 * Backfills contacts for every group/expense a user is already part of.
 *
 * Needed when a virtual user (placeholder for someone without an account)
 * turns real via registration: at invite time there was only one real user
 * involved, so no contact pair was created then, even though the group/
 * expense already links two real accounts once this one activates.
 */
export const syncContactsForUser = async (userId: string) => {
    const [memberships, participations] = await Promise.all([
        prisma.groupMember.findMany({
            where: { userId },
            select: { groupId: true },
        }),
        prisma.expenseParticipant.findMany({
            where: { userId },
            select: { expenseId: true },
        }),
    ]);

    await Promise.all([
        ...memberships.map(async ({ groupId }) => {
            const members = await prisma.groupMember.findMany({
                where: { groupId },
                select: { userId: true },
            });

            await upsertContactsForRealUserIds(
                members.map((m) => m.userId),
                { reactivate: true },
            );
        }),
        ...participations.map(async ({ expenseId }) => {
            const expense = await prisma.expense.findUnique({
                where: { id: expenseId },
                select: {
                    paidById: true,
                    participants: { select: { userId: true } },
                },
            });

            if (!expense) return;

            await upsertContactsForRealUserIds(
                [
                    ...expense.participants.map((p) => p.userId),
                    expense.paidById,
                ],
                { reactivate: true },
            );
        }),
    ]);
};
