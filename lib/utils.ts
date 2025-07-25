import { startOfToday, subYears } from "date-fns";

import { ExpenseParticipant as PrismaExpenseParticipant } from '@prisma/client'

import type { ExpenseParticipant, GroupMember, User } from "./api/types";

export const today = startOfToday();

export const fiveYearsAgo = subYears(today, 5);

export const sortParticipants = (
    participants?: ExpenseParticipant[],
    payerId?: string,
) => {
    if (!participants) return [];

    const sortedParticipants = participants.sort((a, b) => {
        if (a.user.id === payerId) return -1;
        if (b.user.id === payerId) return 1;
        return 0;
    });

    return sortedParticipants;
};

export const getPersonalBalance = (
    paymentMade: number,
    totalAmount: number,
    totalParticipants: number,
) => {
    const amountPayablePerPerson = totalAmount / totalParticipants;
    const debtBalance = amountPayablePerPerson - paymentMade;

    return debtBalance;
};

export const getPositiveTruncatedNumber = (number: number) =>
    Math.floor(Math.abs(number) * 100) / 100;

export const compareMembers = (
    participants?: User[] | { id: string }[],
    members?: GroupMember[],
) => {
    if (!participants || !members)
        return {
            haveDifferences: false,
            differences: { missingMembers: [], excessParticipants: [] },
        };

    const memberIds = members.map((m) => m.userId);
    const participantIds = participants.map((p) => p.id);

    const missingMembers = members
        .filter((m) => !participantIds.includes(m.userId))
        .map((m) => m.user);
    const excessParticipants = participants.filter(
        (p) => !memberIds.includes(p.id),
    );

    const differences = [...missingMembers, ...excessParticipants];

    const response =
        differences.length > 0
            ? {
                haveDifferences: true,
                differences: { missingMembers, excessParticipants },
            }
            : {
                haveDifferences: false,
                differences: { missingMembers: [], excessParticipants: [] },
            };

    return response;
};

export const formatAmount = (value: number) => {
    const hasDecimals = value % 1 !== 0;

    return value.toLocaleString("es-AR", {
        minimumFractionDigits: hasDecimals ? 2 : 0,
        maximumFractionDigits: 2,
    });
};

export const getParticipantIds = (participants: ExpenseParticipant[] | PrismaExpenseParticipant[]) => {
    return participants.map((p) => p.userId);
};

export const getParticipantObjs = (participants: ExpenseParticipant[]) => {
    const seen = new Set();

    return participants
        .map((p) => p.user)
        .filter((user) => {
            if (seen.has(user.id)) return false;
            seen.add(user.id);
            return true;
        });
};
