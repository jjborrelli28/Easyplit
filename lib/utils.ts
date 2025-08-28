import { format, startOfToday, subYears } from "date-fns";

import {
    Expense as PrismaExpense,
    ExpenseParticipant as PrismaExpenseParticipant,
    GroupMember as PrismaGroupMember
} from "@prisma/client";

import { EXPENSE_TYPE } from "@/components/ExpenseTypeSelect/constants";
import { es } from "date-fns/locale";
import type {
    Expense,
    ExpenseParticipant,
    GroupMember,
    User,
} from "./api/types";

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

export const getParticipantIds = (
    participants: ExpenseParticipant[] | PrismaExpenseParticipant[] | GroupMember[] | PrismaGroupMember[],
) => {
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

export const areAllDebtsSettled = (expense: Expense) => {
    return expense.participants
        .filter((p) => p.userId !== expense.paidById)
        .every((p) => {
            const personalBalance = getPersonalBalance(
                p.amount,
                expense.amount,
                expense.participants.length,
            );

            const roundedBalance = Math.floor(personalBalance * 100) / 100;

            return roundedBalance <= 0;
        });
};

export const isExpenseComplete = (
    expense: PrismaExpense & { participants: PrismaExpenseParticipant[] },
) => {
    const participantsCount = expense.participants.length;

    return expense.participants.every((p) => {
        const personalBalance = p.amount - expense.amount / participantsCount;
        const roundedBalance = Math.floor(personalBalance * 100) / 100;
        return roundedBalance <= 0;
    });
};

type ParticipantPaymentType = { userId: string; amount: number | undefined };

type UpdateTypes = {
    name?: string;
    type?: EXPENSE_TYPE;
    participantsToAdd?: string[];
    participantToRemove?: string;
    paidById?: string;
    paymentDate?: Date;
    groupId?: string;
    amount?: number;
    participantPayment?: ParticipantPaymentType;
};

export type UpdatedField = {
    field: string;
    oldValue: string | null;
    newValue: string | null;
};

export const getUpdatedFields: (
    expense: PrismaExpense & { participants: ExpenseParticipant[] },
    updated: UpdateTypes,
) => UpdatedField[] = (expense, updated) => {
    const fieldsToCheck: (keyof UpdateTypes)[] = [
        "name",
        "type",
        "participantsToAdd",
        "participantToRemove",
        "paidById",
        "paymentDate",
        "groupId",
        "amount",
        "participantPayment",
    ];

    return fieldsToCheck.reduce<UpdatedField[]>((acc, field) => {
        let oldValue: unknown;
        let newValue: unknown;

        if (field === "participantsToAdd" || field === "participantToRemove") {
            oldValue = null;
            newValue = updated[field];
        } else if (field === "participantPayment") {
            const userId = updated[field]?.userId;
            const oldAmount = expense.participants.find(
                (p) => p.userId === userId,
            )?.amount;

            oldValue = { userId, amount: oldAmount };
            newValue = updated[field];
        } else {
            oldValue = expense[field];
            newValue = updated[field];
        }

        const oldStr = oldValue !== undefined ? JSON.stringify(oldValue) : null;
        const newStr = newValue !== undefined ? JSON.stringify(newValue) : null;

        if (newStr !== null && oldStr !== newStr) {
            acc.push({
                field: field.toString(),
                oldValue: oldStr,
                newValue: newStr,
            });
        }

        return acc;
    }, []);
};

export const getSuccessMessage = {
    name: (newName: string) => [
        {
            text: `El nombre del gasto fue actualizado a “${newName}”.`,
        },
    ],
    type: (newType: string) => [
        {
            text: `La categoría del gasto fue actualizada a “${newType}”.`,
        },
    ],
    participantsToAdd: (participants: string[]) => [
        {
            text: `Se agregó${participants.length > 1 ? "n" : ""} ${participants.length} participante${participants.length > 1 ? "s" : ""} al gasto.`,
        },
    ],
    participantToRemove: (participant: User) => [
        {
            text: `${participant.name} fue removido del gasto.`,
        },
    ],
    paidById: (participant: User) => [
        {
            text: `Ahora ${participant.name} figura como quien pagó el gasto.`,
        },
    ],
    paymentDate: (date: Date) => [
        {
            text: `La fecha de pago fue actualizada al ${format(
                date,
                "dd 'de' MMMM 'del' yyyy",
                {
                    locale: es,
                },
            )}.`,
        },
    ],
    paymentData: (participant: User, date: Date) => [
        {
            text: "Los detalles del pago fueron actualizados correctamente.",
        },
        {
            text: `Ahora ${participant.name} figura como quien pagó el gasto.`,
            style: "muted",
        },
        {
            text: `La fecha de pago fue actualizada al ${format(
                date,
                "dd 'de' MMMM 'del' yyyy",
                {
                    locale: es,
                },
            )}.`,
            style: "muted",
        },
    ],
    groupId: (groupName: string) => [
        {
            text: `El gasto fue asignado al grupo “${groupName}”.`,
        },
    ],
    amount: (amount: number) => [
        {
            text: `El monto del gasto fue actualizado a $${formatAmount(amount)}.`,
        },
    ],
};

export const getTotalAmountOfExpenses = (expenses?: Expense[]) =>
    expenses?.reduce((total, expense) => total + expense.amount, 0);

export const getTotalPaidByParticipants = (expenses?: Expense[]) => {

    return (
        expenses?.reduce((totalPaid, expense) => {
            const paidInThisExpense = expense.participants.reduce(
                (sum, participant) => {
                    if (participant.userId === expense.paidById) return sum + expense.amount / expense.participants.length;

                    return sum + participant.amount;
                },
                0,
            );

            return totalPaid + paidInThisExpense;
        }, 0) ?? 0
    );
};
