type ExpenseAccessCheck = {
    createdById: string | null;
    paidById: string;
    participants: { userId: string }[];
    group?: { members: { userId: string }[] } | null;
};

type GroupAccessCheck = {
    createdById: string;
    members: { userId: string }[];
};

export const isExpenseAccessible = (
    expense: ExpenseAccessCheck,
    userId: string,
) =>
    userId === expense.createdById ||
    userId === expense.paidById ||
    expense.participants.some((p) => p.userId === userId) ||
    (expense.group?.members.some((m) => m.userId === userId) ?? false);

export const isGroupAccessible = (group: GroupAccessCheck, userId: string) =>
    userId === group.createdById || group.members.some((m) => m.userId === userId);

export const isExpensePrivilegedEditor = (
    expense: { createdById: string | null; paidById: string },
    userId: string,
) => userId === expense.createdById || userId === expense.paidById;

export const isGroupPrivilegedEditor = (
    group: { createdById: string },
    userId: string,
) => userId === group.createdById;
