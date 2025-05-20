import nodemailer, { type SendMailOptions } from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
    },
});

export const sendMail = async ({
    to,
    subject,
    text,
    html,
}: SendMailOptions) => {
    try {
        await transporter.sendMail({
            from: `"Easyplit" <${process.env.NODEMAILER_USER}>`,
            to,
            subject,
            text,
            html,
        });
    } catch (error) {
        console.log(error);

        throw new Error("Error al intentar enviar el correo electrónico.");
    }
};
