import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendVerificationEmail = async (
    email: string,
    verifyToken: string,
) => {
    const verificationUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${verifyToken}`;

    const mailOptions = {
        from: `"Easyplit" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verificación de correo electrónico en Easyplit",
        text: `Verifique su correo electrónico haciendo clic en el enlace: ${verificationUrl}`,
        html: `<p>Verifique su correo electrónico haciendo clic en el siguiente enlace: <a href="${verificationUrl}">¡Verificar Ahora!</a></p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error("Error al intentar enviar el correo electrónico de verificación");
    }
};

export const sendMail = async ({
    to,
    subject,
    text,
    html
}: {
    to: string;
    subject: string;
    text?: string;
    html?: string
}) => {
    try {
        await transporter.sendMail({
            from: `"Easyplit" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        });
    } catch (error) {
        throw new Error("Error al intentar enviar el correo electrónico");
    }
};
