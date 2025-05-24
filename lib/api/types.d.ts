import type { MessageCardProps } from "@/components/MessageCard";
import API_RESPONSE_CODE from "./API_RESPONSE_CODE";
import ICON_MAP from "../icons";

// Error response
export interface ErrorResponse<T> {
    success: boolean;
    error: {
        code: API_RESPONSE_CODE;
        message: string[];
        fields?: T;
        details?: unknown;
        statusCode: number;
    };
}

export type AuthError<T> = {
    response: {
        data: ErrorResponse<T>;
    };
};

// Success response
export type ResponseIcon = keyof typeof ICON_MAP;

export type ResponseMessage = Pick<
    MessageCardProps,
    "color" | "title" | "actionLabel" | "actionHref"
> & { icon: ResponseIcon; content: MessageCardProps['children'] };

export interface SuccessResponse {
    success: true;
    code: API_RESPONSE_CODE;
    message: ResponseMessage;
    data?: {
        id: string;
        name: string | null;
        email: string | null;
    };
}
