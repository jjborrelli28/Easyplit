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
        console.error(error);

        throw new Error(
            "Error al intentar enviar el correo electrónico de verificación.",
        );
    }
};

export const parseNameForAvatar = (name: string) => {
    return name
        .trim()
        .split(/\s+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("+");
};

export const getRandomColorPair = () => {
    const background = `#${Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0")}`;

    const r = parseInt(background.slice(1, 3), 16) / 255;
    const g = parseInt(background.slice(3, 5), 16) / 255;
    const b = parseInt(background.slice(5, 7), 16) / 255;

    const [R, G, B] = [r, g, b].map((c) =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
    );

    const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;
    const text = luminance > 0.5 ? "191919" : "ffffff";

    return { background: background.replace("#", ""), text };
};
