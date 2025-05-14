import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendVerificationEmail = async (email: string, verifyToken: string) => {
    const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${verifyToken}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verificación de correo electrónico en Easyplit',
        text: `Verifique su correo electrónico haciendo clic en el enlace: ${verificationUrl}`,
        html: `<p>Verifique su correo electrónico haciendo clic en el siguiente enlace: <a href="${verificationUrl}">Verificar Ahora!</a></p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log('Error al enviar el correo electrónico de verificación:', error)

        throw new Error('Error al enviar el correo electrónico de verificación');
    }
};

