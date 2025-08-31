import { format, startOfToday, subYears } from "date-fns";

import {
    Expense as PrismaExpense,
    ExpenseParticipant as PrismaExpenseParticipant,
    Group as PrismaGroup,
    GroupMember as PrismaGroupMember,
} from "@prisma/client";
import { es } from "date-fns/locale";

import { EXPENSE_TYPE } from "@/components/ExpenseTypeSelect/constants";
import { GROUP_TYPE } from "@/components/GroupTypeSelect/constants";
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
    participants:
        | ExpenseParticipant[]
        | PrismaExpenseParticipant[]
        | GroupMember[]
        | PrismaGroupMember[],
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

type UpdateExpenseTypes = {
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

export const getUpdatedExpenseFields: (
    expense: PrismaExpense & { participants: ExpenseParticipant[] },
    updated: UpdateExpenseTypes,
) => UpdatedField[] = (expense, updated) => {
    const fieldsToCheck: (keyof UpdateExpenseTypes)[] = [
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

const SUCCESS_MESSAGE_VARIANTS = {
    expense: "gasto",
    group: "grupo",
};

export const getSuccessMessage = {
    name: (newName: string, variant: "expense" | "group") => [
        {
            text: `El nombre del ${SUCCESS_MESSAGE_VARIANTS[variant]} fue actualizado a “${newName}”.`,
        },
    ],
    type: (newType: string, variant: "expense" | "group") => [
        {
            text: `La categoría del ${SUCCESS_MESSAGE_VARIANTS[variant]} fue actualizada a “${newType}”.`,
        },
    ],
    participantsToAdd: (participants: string[]) => [
        {
            text: `Se ${participants.length > 1 ? "agregaron" : "agregó"} ${participants.length} participante${participants.length > 1 ? "s" : ""} al gasto.`,
        },
    ],
    participantToRemove: (participantName?: string | null) => [
        {
            text: `${participantName} fue removido del gasto.`,
        },
    ],
    paidById: (participantName?: string | null) => [
        {
            text: `Ahora ${participantName} figura como quien pagó el gasto.`,
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
    paymentData: (participantName: string | null | undefined, date: Date) => [
        {
            text: "Los detalles del pago fueron actualizados correctamente.",
        },
        {
            text: `Ahora ${participantName} figura como quien pagó el gasto.`,
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
    membersToAdd: (members: string[]) => [
        {
            text: `Se ${members.length > 1 ? "agregaron" : "agregó"} ${members.length} mimenbro${members.length > 1 ? "s" : ""} al grupo.`,
        },
    ],
    memberToRemove: (memberName?: string | null) => [
        {
            text: `${memberName} fue removido del grupo.`,
        },
    ],
    expensesToAdd: (expenses: string[]) => [
        {
            text: `Se ${expenses.length > 1 ? "agregaron" : "agregó"} ${expenses.length} gasto${expenses.length > 1 ? "s" : ""} al grupo.`,
        },
    ],
    expenseToRemove: (expenseName?: string) => [
        {
            text: `${expenseName} fue removido del grupo.`,
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
                    if (participant.userId === expense.paidById)
                        return sum + expense.amount / expense.participants.length;

                    return sum + participant.amount;
                },
                0,
            );

            return totalPaid + paidInThisExpense;
        }, 0) ?? 0
    );
};

type UpdateGroupTypes = {
    name?: string;
    type?: GROUP_TYPE;
    membersToAdd?: string[];
    memberToRemove?: string;
    expensesToAdd?: string[];
    expeneToRemove?: string;
};

export const getUpdatedGroupFields: (
    group: PrismaGroup & { members: GroupMember[] },
    updated: UpdateGroupTypes,
) => UpdatedField[] = (group, updated) => {
    const fieldsToCheck: (keyof UpdateGroupTypes)[] = [
        "name",
        "type",
        "membersToAdd",
        "memberToRemove",
        "expensesToAdd",
        "expeneToRemove",
    ];

    return fieldsToCheck.reduce<UpdatedField[]>((acc, field) => {
        let oldValue: unknown;
        let newValue: unknown;

        if (
            field === "membersToAdd" ||
            field === "memberToRemove" ||
            field === "expensesToAdd" ||
            field === "expeneToRemove"
        ) {
            oldValue = null;
            newValue = updated[field];
        } else {
            oldValue = group[field];
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
