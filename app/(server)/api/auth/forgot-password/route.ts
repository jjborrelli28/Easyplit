import { randomBytes } from "crypto";
import { addHours } from "date-fns";
import { NextResponse } from "next/server";

import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { forgotPasswordSchema } from "@/lib/validations/schemas";

export const POST = async (req: Request) => {
    try {
        // Step 1: Parse and validate the request body using Zod
        const body = await req.json();
        const result = forgotPasswordSchema.safeParse(body);

        // Step 2: Return 400 with field-level errors if validation fails
        if (!result.success) {
            return NextResponse.json(
                {
                    error: {
                        fields: parseZodErrors(result.error),
                        code: "INVALID_INPUT",
                    },
                },
                { status: 400 }
            );
        }

        const { email } = result.data;

        // Step 3: Look up user by email
        const user = await prisma.user.findUnique({ where: { email } });

        // Step 4: Return 404 if user doesn't exist
        if (!user) {
            return NextResponse.json(
                {
                    error: {
                        result: "Email address is not registered.",
                        code: "EMAIL_NOT_FOUND",
                    },
                },
                { status: 404 }
            );
        }

        // Step 5: Generate a reset token and its expiration time (1 hour from now)
        const resetToken = randomBytes(32).toString("hex");
        const resetTokenExp = addHours(new Date(), 1);

        // Step 6: Save the token and expiration time to the user's record
        await prisma.user.update({
            where: { email },
            data: {
                resetToken,
                resetTokenExp,
            },
        });

        // Step 7: Build the password reset link including the token
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

        // Step 8: Send reset email with the link to the user
        await sendMail({
            to: email,
            subject: "Reset your password on Easysplit",
            html: `<p>Click the following link to reset your password: <a href="${resetLink}">Reset Now</a></p>`,
        });

        // Step 9: Return success message
        return NextResponse.json({ message: "Password reset email sent successfully." });
    } catch (error) {
        console.log(error);

        // Step 10: Handle unexpected server errors
        return NextResponse.json(
            {
                error: {
                    result: "Internal server error.",
                    code: "INTERNAL_ERROR",
                },
            },
            { status: 500 }
        );
    }
};
