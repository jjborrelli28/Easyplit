import prisma from "@/lib/prisma";

/**
 * Records that every pair of real users among `userIds` has shared a group
 * or expense, so they stay discoverable in each other's search even after
 * that group/expense is deleted or they stop sharing anything active.
 */
export const upsertContactsForRealUserIds = async (userIds: string[]) => {
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
    const memberships = await prisma.groupMember.findMany({
        where: { userId },
        select: { groupId: true },
    });

    for (const { groupId } of memberships) {
        const members = await prisma.groupMember.findMany({
            where: { groupId },
            select: { userId: true },
        });

        await upsertContactsForRealUserIds(members.map((m) => m.userId));
    }

    const participations = await prisma.expenseParticipant.findMany({
        where: { userId },
        select: { expenseId: true },
    });

    for (const { expenseId } of participations) {
        const expense = await prisma.expense.findUnique({
            where: { id: expenseId },
            select: { paidById: true, participants: { select: { userId: true } } },
        });

        if (!expense) continue;

        await upsertContactsForRealUserIds([
            ...expense.participants.map((p) => p.userId),
            expense.paidById,
        ]);
    }
};
