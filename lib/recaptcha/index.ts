import axios from "axios";

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

type VerifyRecaptchaResponse = {
    success: boolean;
    score?: number;
    action?: string;
    challenge_ts?: string;
    hostname?: string;
    "error-codes"?: string[];
};

const verifyRecaptcha = async (recaptchaToken: string): Promise<void> => {
    const secret = process.env.RECAPTCHA_SECRET_KEY;

    if (!secret) {
        throw new Error("RECAPTCHA_SECRET_KEY no está definida");
    }

    const params = new URLSearchParams({
        secret,
        response: recaptchaToken,
    });

    const { data } = await axios.post<VerifyRecaptchaResponse>(RECAPTCHA_VERIFY_URL, params);

    if (!data.success || (data.score !== undefined && data.score < 0.5)) {
        throw new Error("Fallo la verificación de reCAPTCHA.");
    }
};

export default verifyRecaptcha


