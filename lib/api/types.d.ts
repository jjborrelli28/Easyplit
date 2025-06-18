import type { MessageCardProps } from "@/components/MessageCard";
import API_RESPONSE_CODE from "./API_RESPONSE_CODE";
import ICON_MAP from "../icons";

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
    }
}
