import type { Prisma } from "@prisma/client";
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

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

interface SendVirtualUserInvitationEmailParams {
    to: string;
    inviterName: string;
    context?: string;
}

export const sendVirtualUserInvitationEmail = async ({
    to,
    inviterName,
    context,
}: SendVirtualUserInvitationEmailParams) => {
    const safeInviterName = escapeHtml(inviterName);
    const safeContext = context ? escapeHtml(context) : null;
    const registerUrl = `${process.env.NEXT_PUBLIC_APP_URL}/register`;

    const { html, text } = renderEmailTemplate({
        previewText: `${safeInviterName} te agregó en Easyplit.`,
        heading: "Te agregaron a Easyplit",
        paragraphs: [
            `<strong>${safeInviterName}</strong> te agregó${
                safeContext ? ` a <strong>"${safeContext}"</strong>` : ""
            } en Easyplit, una app para organizar y dividir gastos compartidos.`,
            "Creá tu cuenta con este mismo correo para ver el detalle y empezar a usarla.",
        ],
        ctaLabel: "Crear mi cuenta",
        ctaUrl: registerUrl,
        footerNote: "Si no esperabas este correo, podés ignorarlo.",
    });

    const options: SendMailOptions = {
        to,
        subject: `${inviterName} te agregó en Easyplit`,
        html,
        text,
    };

    try {
        await sendMail(options);
    } catch (error) {
        console.error(error);

        throw new Error(
            "Error al intentar enviar el correo electrónico de invitación a Easyplit.",
        );
    }
};

interface SendAddedToGroupOrExpenseEmailParams {
    to: string;
    inviterName: string;
    context?: string;
}

export const sendAddedToGroupOrExpenseEmail = async ({
    to,
    inviterName,
    context,
}: SendAddedToGroupOrExpenseEmailParams) => {
    const safeInviterName = escapeHtml(inviterName);
    const safeContext = context ? escapeHtml(context) : null;
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`;

    const { html, text } = renderEmailTemplate({
        previewText: `${safeInviterName} te agregó en Easyplit.`,
        heading: "Te agregaron a algo en Easyplit",
        paragraphs: [
            `<strong>${safeInviterName}</strong> te agregó${
                safeContext ? ` a <strong>"${safeContext}"</strong>` : ""
            } en Easyplit.`,
            "Iniciá sesión con tu cuenta para ver el detalle.",
        ],
        ctaLabel: "Iniciar sesión",
        ctaUrl: loginUrl,
        footerNote: "Si no esperabas este correo, podés ignorarlo.",
    });

    const options: SendMailOptions = {
        to,
        subject: `${inviterName} te agregó en Easyplit`,
        html,
        text,
    };

    try {
        await sendMail(options);
    } catch (error) {
        console.error(error);

        throw new Error(
            "Error al intentar enviar el correo de notificación de Easyplit.",
        );
    }
};

interface SendPendingInvitationEmailParams {
    to: string;
    inviterName: string;
    context?: string;
}

export const sendPendingInvitationEmail = async ({
    to,
    inviterName,
    context,
}: SendPendingInvitationEmailParams) => {
    const safeInviterName = escapeHtml(inviterName);
    const safeContext = context ? escapeHtml(context) : null;
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`;

    const { html, text } = renderEmailTemplate({
        previewText: `${safeInviterName} te invitó en Easyplit.`,
        heading: "Tenés una invitación en Easyplit",
        paragraphs: [
            `<strong>${safeInviterName}</strong> quiere agregarte${
                safeContext ? ` a <strong>"${safeContext}"</strong>` : ""
            } en Easyplit.`,
            "Iniciá sesión para aceptar o rechazar la invitación.",
        ],
        ctaLabel: "Iniciar sesión",
        ctaUrl: loginUrl,
        footerNote: "Si no esperabas este correo, podés ignorarlo.",
    });

    const options: SendMailOptions = {
        to,
        subject: `${inviterName} te invitó en Easyplit`,
        html,
        text,
    };

    try {
        await sendMail(options);
    } catch (error) {
        console.error(error);

        throw new Error(
            "Error al intentar enviar el correo de invitación pendiente de Easyplit.",
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

/**
 * Reassigns every group/expense relation from a virtual user to a real user
 * (e.g. after that person registers with the email used to invite them), then
 * deletes the now-empty virtual user. Falls back to dropping a relation row
 * when the target is already linked to the same group/expense.
 */
export const mergeVirtualUserInto = async (
    tx: Prisma.TransactionClient,
    fromUserId: string,
    toUserId: string,
) => {
    const groupMembers = await tx.groupMember.findMany({
        where: { userId: fromUserId },
    });

    for (const member of groupMembers) {
        try {
            await tx.groupMember.update({
                where: { id: member.id },
                data: { userId: toUserId },
            });
        } catch {
            await tx.groupMember.delete({ where: { id: member.id } });
        }
    }

    const participants = await tx.expenseParticipant.findMany({
        where: { userId: fromUserId },
    });

    for (const participant of participants) {
        try {
            await tx.expenseParticipant.update({
                where: { id: participant.id },
                data: { userId: toUserId },
            });
        } catch {
            await tx.expenseParticipant.delete({ where: { id: participant.id } });
        }
    }

    await tx.expense.updateMany({
        where: { paidById: fromUserId },
        data: { paidById: toUserId },
    });
    await tx.expense.updateMany({
        where: { createdById: fromUserId },
        data: { createdById: toUserId },
    });
    await tx.group.updateMany({
        where: { createdById: fromUserId },
        data: { createdById: toUserId },
    });
    await tx.groupHistory.updateMany({
        where: { updatedById: fromUserId },
        data: { updatedById: toUserId },
    });
    await tx.expenseHistory.updateMany({
        where: { updatedById: fromUserId },
        data: { updatedById: toUserId },
    });

    await tx.user.delete({ where: { id: fromUserId } });
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
