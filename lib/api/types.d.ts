import type { GroupType } from "@prisma/client";

import ICON_MAP from "../icons";
import API_RESPONSE_CODE from "./API_RESPONSE_CODE";

import type { MessageCardProps } from "@/components/MessageCard";

/* Response message types */
export type ResponseIcon = keyof typeof ICON_MAP;

export interface ResponseMessage
    extends Pick<
        MessageCardProps,
        "color" | "title" | "actionLabel" | "actionHref"
    > {
    icon: ResponseIcon;
    content: MessageCardProps["children"];
}

/* Success response type */
export interface SuccessResponse<D = undefined> {
    success: true;
    code: API_RESPONSE_CODE;
    message?: ResponseMessage;
    data?: D;
}

/* Error response types */
export interface ServerErrorResponse<F = undefined> {
    success: boolean;
    error: {
        code: API_RESPONSE_CODE;
        message: string[];
        fields?: F;
        details?: unknown;
        statusCode: number;
    };
}

export interface ErrorResponse<F = undefined> {
    response: {
        data: ServerErrorResponse<F>;
    };
}

/* Authentication form fields */
export interface RegisterFields {
    name?: string;
    email?: string;
    password?: string;
    recaptchaToken?: string;
}

export interface ForgotPasswordFields {
    email?: string;
    recaptchaToken?: string;
}

export interface ResetPasswordFields {
    password?: string;
    token?: string;
}
/* End of authentication form fields */

/* User types */
export interface User {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
}

export interface GetUserField {
    id: string;
}

export interface UpdateUserFields {
    id?: string;
    name?: string;
    password?: string;
    currentPassword?: string;
}

export interface DeleteUserFields {
    id?: string;
    password?: string;
}
/* End user types */

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
    user: User;
}

export interface Expense {
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

// Groups
export interface CreateGroupFields {
    name: string;
    type?: GroupType;
    createdById: string;
    memberIds: string[];
}

export interface GroupMember {
    id: string;
    userId: string;
    groupId: string;
    user: User;
}

export interface Group {
    id: string;
    name: string;
    type: GroupType;
    createdAt: Date;
    createdById: string;
    createdBy: User;
    members: GroupMember[];
    expenses?: Expense[];
}

export interface DeleteExpenseGroupFields {
    data: { id?: string };
}
