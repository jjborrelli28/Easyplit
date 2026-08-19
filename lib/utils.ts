import { format, startOfToday, subYears } from "date-fns";

import {
    Expense as PrismaExpense,
    ExpenseParticipant as PrismaExpenseParticipant,
    Group as PrismaGroup,
    GroupMember as PrismaGroupMember,
} from "@prisma/client";
import { es } from "date-fns/locale";

import {
    EXPENSE_TYPE,
    EXPENSE_TYPES,
} from "@/components/ExpenseTypeSelect/constants";
import {
    GROUP_TYPE,
    GROUP_TYPES,
} from "@/components/GroupTypeSelect/constants";
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
    Math.round(Math.abs(number) * 100) / 100;

export const compareMembers = (
    participants?: { id: string }[],
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

interface SettleableExpense {
    amount: number;
    paidById: string;
    participants: { userId: string; amount: number }[];
}

// Structural (not `Expense`/`PrismaExpense`-typed) on purpose: whether an
// expense is settled only ever depends on these four fields, so this one
// definition works for both the app's `Expense` type (participants include
// `user`) and Prisma's raw query results (participants don't) — no need for
// a second, separately-maintained copy of this calculation.
export const areAllDebtsSettled = (expense: SettleableExpense) => {
    return expense.participants
        .filter((p) => p.userId !== expense.paidById)
        .every((p) => {
            const personalBalance = getPersonalBalance(
                p.amount,
                expense.amount,
                expense.participants.length,
            );

            return Math.round(personalBalance * 100) <= 0;
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

type FieldResolver<Entity, Updated> = (
    entity: Entity,
    updated: Updated,
) => { oldValue: unknown; newValue: unknown };

/**
 * Shared diffing algorithm behind `getUpdatedExpenseFields` and
 * `getUpdatedGroupFields`: for each field to check, either treat it as an
 * "action" field (add/remove list, no meaningful old value), resolve it with
 * a custom resolver (fields whose old value isn't just `entity[field]`), or
 * fall back to comparing `entity[field]` against `updated[field]`.
 */
const getUpdatedFields = <
    Entity extends object,
    Updated extends Record<string, unknown>,
>(
    entity: Entity,
    updated: Updated,
    fieldsToCheck: (keyof Updated)[],
    actionFields: (keyof Updated)[],
    customResolvers: Partial<Record<keyof Updated, FieldResolver<Entity, Updated>>> = {},
): UpdatedField[] => {
    return fieldsToCheck.reduce<UpdatedField[]>((acc, field) => {
        const customResolver = customResolvers[field];

        let oldValue: unknown;
        let newValue: unknown;

        if (customResolver) {
            ({ oldValue, newValue } = customResolver(entity, updated));
        } else if (actionFields.includes(field)) {
            oldValue = null;
            newValue = updated[field];
        } else {
            oldValue = (entity as Record<string, unknown>)[field as string];
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

export const getUpdatedExpenseFields = (
    expense: PrismaExpense & { participants: ExpenseParticipant[] },
    updated: UpdateExpenseTypes,
): UpdatedField[] =>
    getUpdatedFields(
        expense,
        updated,
        [
            "name",
            "type",
            "participantsToAdd",
            "participantToRemove",
            "paidById",
            "paymentDate",
            "groupId",
            "amount",
            "participantPayment",
        ],
        ["participantsToAdd", "participantToRemove"],
        {
            participantPayment: (expense, updated) => {
                const userId = updated.participantPayment?.userId;
                const oldAmount = expense.participants.find(
                    (p) => p.userId === userId,
                )?.amount;

                return {
                    oldValue: { userId, amount: oldAmount },
                    newValue: updated.participantPayment,
                };
            },
        },
    );

const SUCCESS_MESSAGE_VARIANT = {
    expense: "gasto",
    group: "grupo",
};

export const getSuccessMessage = {
    name: (newName: string, variant: "expense" | "group") => [
        {
            text: `El nombre del ${SUCCESS_MESSAGE_VARIANT[variant]} fue actualizado a “${newName}”.`,
        },
    ],
    type: (
        newType: keyof typeof EXPENSE_TYPES | keyof typeof GROUP_TYPES,
        variant: "expense" | "group",
    ) => {
        const typeName =
            variant === "expense"
                ? EXPENSE_TYPES[newType as keyof typeof EXPENSE_TYPES].label
                : GROUP_TYPES[newType as keyof typeof GROUP_TYPES].label;

        return [
            {
                text: `La categoría del ${SUCCESS_MESSAGE_VARIANT[variant]} fue actualizada a “${typeName}”.`,
            },
        ];
    },
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
    expenseToRemove?: string;
};

export const getUpdatedGroupFields = (
    group: PrismaGroup & { members: GroupMember[] },
    updated: UpdateGroupTypes,
): UpdatedField[] =>
    getUpdatedFields(
        group,
        updated,
        [
            "name",
            "type",
            "membersToAdd",
            "memberToRemove",
            "expensesToAdd",
            "expenseToRemove",
        ],
        ["membersToAdd", "memberToRemove", "expensesToAdd", "expenseToRemove"],
    );

export interface UserBalance extends User {
    id: string;
    name: string;
    balance: number;
}

export const calculateBalances = (expenses: Expense[]) => {
    const balances: Record<string, UserBalance> = {};

    expenses.forEach((expense) => {
        const participants = expense.participants;
        const split = expense.amount / participants.length;

        participants.forEach((p: ExpenseParticipant) => {
            if (!balances[p.userId]) {
                balances[p.userId] = {
                    id: p.user.id,
                    name: p.user.name!,
                    email: p.user.email,
                    image: p.user.image,
                    balance: 0,
                };
            }

            const paid = p.amount;
            const shouldPay = split;

            balances[p.userId].balance += paid - shouldPay;
        });
    });

    return Object.values(balances);
};

export interface SimplifiedDebt {
    from: UserBalance;
    to: UserBalance;
    amount: number;
}

export const simplifyDebts: (balances: UserBalance[]) => SimplifiedDebt[] = (
    balances,
) => {
    const debtors = balances.filter((u) => u.balance < 0).map((u) => ({ ...u }));
    const creditors = balances
        .filter((u) => u.balance > 0)
        .map((u) => ({ ...u }));
    const transactions: { from: UserBalance; to: UserBalance; amount: number }[] =
        [];

    let i = 0,
        j = 0;

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        // Keep the running balances unrounded (avoids losing precision across
        // iterations), but only round-and-emit at the point where a value is
        // actually shown/transferred, and only treat a balance as settled once
        // it rounds to exactly $0 — otherwise sub-cent float noise (e.g. from
        // dividing an expense unevenly) can either fabricate a phantom
        // fraction-of-a-cent transaction or stop the loop from advancing.
        const rawAmount = Math.min(-debtor.balance, creditor.balance);
        const amount = Math.round(rawAmount * 100) / 100;

        if (amount > 0) {
            transactions.push({
                from: debtor,
                to: creditor,
                amount,
            });
        }

        debtor.balance += rawAmount;
        creditor.balance -= rawAmount;

        if (Math.round(debtor.balance * 100) === 0) i++;
        if (Math.round(creditor.balance * 100) === 0) j++;
    }

    return transactions;
};
