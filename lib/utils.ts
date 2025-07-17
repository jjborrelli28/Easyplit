import { startOfToday, subYears } from "date-fns";

import type { ExpenseParticipant } from "./api/types";

export const today = startOfToday();

export const fiveYearsAgo = subYears(today, 5);

export const sortParticipants = (participants?: ExpenseParticipant[], payerId?: string) => {
    if (!participants) return []

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