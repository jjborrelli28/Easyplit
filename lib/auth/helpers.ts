import bcrypt from "bcryptjs";
import type { SendMailOptions } from "nodemailer";

import { sendMail } from "../mailer";

export const hashPassword = (password: string) => bcrypt.hash(password, 10);

export const sendVerificationEmail = async (
    email: string,
    verifyToken: string,
) => {
    const verificationUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${verifyToken}`;

    const options: SendMailOptions = {
        to: email,
        subject: "Verificación de correo electrónico en Easyplit",
        html: `<p>Verifique su correo electrónico haciendo clic en el siguiente enlace: <a href="${verificationUrl}">¡Verificar Ahora!</a></p>`,
    };

    try {
        await sendMail(options);
    } catch (error) {
        console.log(error);

        throw new Error(
            "Error al intentar enviar el correo electrónico de verificación.",
        );
    }
};
