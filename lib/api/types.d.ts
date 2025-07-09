import type {
    ExpenseType,
    GroupType
} from "@prisma/client";

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
    id?: string;
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

/* Expense types */
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
    type?: ExpenseType | null;
    amount: number;
    paidById: string;
    paidBy: User;
    groupId?: string | null;
    group?: Group | null;
    createdAt: Date;
    participants: ExpenseParticipant[];
}

export interface CreateExpenseFields {
    name: string;
    type?: ExpenseType;
    amount: number;
    participantIds: string[];
    participants: Session["user"][];
    paidById: string;
    groupId?: string;
}

export interface ExpenseCreationFieldErrors {
    name?: string;
    type?: string;
    amount?: string;
    participantIds?: string;
    paidById?: string;
    groupId?: string;
}

export interface DeleteExpenseGroupFields {
    data: { id?: string };
}
/* End expense types */

/* Group types */
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

export interface CreateGroupFields {
    name: string;
    type?: GroupType;
    createdById: string;
    memberIds: string[];
    expenses?: Expense[];
}

export interface GroupCreationFieldErrors {
    name?: string;
    type?: string;
    createdById?: string;
    memberIds?: string;
    expenses?: string;
}
/* End group types */


