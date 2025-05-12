import { type ZodError } from "zod";

export const parseZodErrors = (error: ZodError) => {
    return error.issues.reduce((acc, issue) => {
        const field = issue.path[0] as string;
        acc[field] = issue.message;
        return acc;
    }, {} as Record<string, string>);
}
