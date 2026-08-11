import bcrypt from "bcryptjs";
import type { SendMailOptions } from "nodemailer";

import { renderEmailTemplate } from "../email/template";
import { sendMail } from "../mailer";

export const hashPassword = (password: string) => bcrypt.hash(password, 10);

export const sendVerificationEmail = async (
    email: string,
    verifyToken: string,
) => {
    const verificationUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${verifyToken}`;

    const { html, text } = renderEmailTemplate({
        previewText:
            "Verificá tu correo electrónico para activar tu cuenta en Easyplit.",
        heading: "Verificá tu correo electrónico",
        paragraphs: [
            "¡Gracias por registrarte en Easyplit! Para activar tu cuenta, hacé clic en el siguiente botón.",
        ],
        ctaLabel: "Verificar mi correo",
        ctaUrl: verificationUrl,
        footerNote:
            "Si no creaste una cuenta en Easyplit, podés ignorar este correo.",
    });

    const options: SendMailOptions = {
        to: email,
        subject: "Verificación de correo electrónico en Easyplit",
        html,
        text,
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

export const sendPasswordChangedEmail = async (email: string) => {
    const { html, text } = renderEmailTemplate({
        previewText: "Tu contraseña de Easyplit fue actualizada.",
        heading: "Tu contraseña fue actualizada",
        paragraphs: [
            "Te confirmamos que la contraseña de tu cuenta de Easyplit se cambió correctamente.",
        ],
        footerNote:
            "Si no fuiste vos quien hizo este cambio, escribinos de inmediato a easyplit@gmail.com.",
    });

    const options: SendMailOptions = {
        to: email,
        subject: "Tu contraseña fue actualizada en Easyplit",
        html,
        text,
    };

    try {
        await sendMail(options);
    } catch (error) {
        console.error(error);

        throw new Error(
            "Error al intentar enviar el correo electrónico de aviso de cambio de contraseña.",
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
