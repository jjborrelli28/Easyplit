import ICON_MAP from "../icons";
import API_RESPONSE_CODE from "./API_RESPONSE_CODE";

import type { MessageCardProps } from "@/components/MessageCard";

// Success response
export type ResponseIcon = keyof typeof ICON_MAP;

export type ResponseMessage = Pick<
    MessageCardProps,
    "color" | "title" | "actionLabel" | "actionHref"
> & { icon: ResponseIcon; content: MessageCardProps["children"] };

export interface SuccessResponse<D = undefined> {
    success: true;
    code: API_RESPONSE_CODE;
    message?: ResponseMessage;
    data?: D;
}

// Error response
export type ServerErrorResponse<F = undefined> = {
    success: boolean;
    error: {
        code: API_RESPONSE_CODE;
        message: string[];
        fields?: F;
        details?: unknown;
        statusCode: number;
    };
};

export type ErrorResponse<F = undefined> = {
    response: {
        data: ServerErrorResponse<F>;
    };
};

// User Data
export type UserData = {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
};

export interface CompletedUserData {
    id: string;
    name: string;
    email: string;
    image: string;
    password: string | null;
    emailVerified: Date | null;
    createdAt: Date;
    resetToken: string | null;
    resetTokenExp: Date | null;
    verifyToken: string | null;
    verifyTokenExp: Date | null;
}

// Field types
export interface ForgotPasswordFields {
    email: string;
}

export interface RegisterFields {
    name: string;
    email: string;
    password: string;
}

export interface ResetPasswordFields {
    password: string;
}

export interface UpdateUserFields {
    id: string;
    name?: string;
    password?: string;
    currentPassword?: string;
}

export interface DeleteUserFields {
    data: {
        id: string;
        password?: string;
    };
}

// Groups
export interface CreateGroupFields {
    name: string;
    createdById: string;
    memberIds: string[];
}

export interface GroupMember {
    id: string;
    userId: string;
    groupId: string;
    user: CompletedUserData;
    group: Group;
}

export interface GroupData {
    id: string;
    name: string;
    createdAt: Date;
    createdById: string;
    members: GroupMember[];
    expenses: Expense[];
}

// Expenses
export interface CreateExpenseFields {
    name: string;
    createdById: string;
    amount: number;
    participantIds: string[];
    groupId?: string;
}

export interface ExpenseParticipant {
    id: string;
    expenseId: string;
    userId: string;
    amount: number;
    expense: Expense;
    user: User;
}

export interface ExpenseData {
    id: string;
    name: string;
    amount: number;
    paidById: string;
    paidBy: User;
    groupId?: string | null;
    group?: Group | null;
    createdAt: Date;
    participants: ExpenseParticipant[];
}

export interface DeleteExpenseFields {
    data: { id?: string; }
}