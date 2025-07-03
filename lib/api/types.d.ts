import ICON_MAP from "../icons";
import API_RESPONSE_CODE from "./API_RESPONSE_CODE";

import { GROUP_TYPE } from "@/components/GroupTypeSelector";
import type { MessageCardProps } from "@/components/MessageCard";

// Response message types
export type ResponseIcon = keyof typeof ICON_MAP;

export interface ResponseMessage extends Pick<
    MessageCardProps,
    "color" | "title" | "actionLabel" | "actionHref"
> { icon: ResponseIcon; content: MessageCardProps["children"] };

// Success response type
export interface SuccessResponse<D = undefined> {
    success: true;
    code: API_RESPONSE_CODE;
    message?: ResponseMessage;
    data?: D;
}

// Error response types
export interface ServerErrorResponse<F = undefined> {
    success: boolean;
    error: {
        code: API_RESPONSE_CODE;
        message: string[];
        fields?: F;
        details?: unknown;
        statusCode: number;
    };
};

export interface ErrorResponse<F = undefined> {
    response: {
        data: ServerErrorResponse<F>;
    };
};

// User types
export interface UserData {
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

// Form fields
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

// Expenses
export interface CreateExpenseFields {
    name: string;
    createdById: string;
    amount: number;
    participantIds: string[];
    groupId?: string;
}

export interface ExpenseParticipantData {
    id: string;
    expenseId: string;
    userId: string;
    amount: number;
    user: UserData;
}

export interface ExpenseData {
    id: string;
    name: string;
    amount: number;
    paidById: string;
    paidBy: UserData;
    groupId?: string | null;
    group?: GroupData | null;
    createdAt: Date;
    participants: ExpenseParticipantData[];
}

// Groups
export interface CreateGroupFields {
    name: string;
    type?: GROUP_TYPE;
    createdById: string;
    memberIds: string[];
}

export interface GroupMember {
    id: string;
    userId: string;
    groupId: string;
    user: UserData;
}

export interface GroupData {
    id: string;
    name: string;
    type: GROUP_TYPE;
    createdAt: Date;
    createdById: string;
    createdBy: UserData;
    members: GroupMember[];
    expenses?: ExpenseData[];
}

export interface DeleteExpenseGroupFields {
    data: { id?: string };
}
