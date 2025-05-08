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
        subject: 'Verify your email address',
        text: `Please verify your email by clicking the link: ${verificationUrl}`,
        html: `<p>Please verify your email by clicking the link: <a href="${verificationUrl}">Verify Email</a></p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent!');
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Error sending verification email');
    }
};

