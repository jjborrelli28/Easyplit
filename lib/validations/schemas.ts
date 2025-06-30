import { GROUP_TYPE } from "@/components/GroupTypeSelector";
import { z } from "zod";

// Rules
const name = z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .refine((value) => !/\d/.test(value), {
        message: "El nombre de usuario no puede tener números.",
    });
const email = z.string().email("El correo electrónico no es válido");
const password = z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .regex(/[A-Za-z]/, "La contraseña debe contener al menos una letra")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número");
const recaptchaToken = z
    .string({
        required_error: "Demuestra que no eres un robot",
        invalid_type_error: "Demuestra que no eres un robot",
    })
    .min(1, "El token de reCAPTCHA es invalido");

// Schemas
export const registerSchema = z.object({
    name,
    email,
    password,
    recaptchaToken,
});

export const loginSchema = z.object({
    email,
    password,
    recaptchaToken,
});

export const forgotPasswordSchema = z.object({
    email,
    recaptchaToken,
});

export const passwordSchema = z.object({
    password,
});

export const recaptchaTokenSchema = z.object({
    recaptchaToken,
});

export const nameSchema = z.object({
    name,
});

export const createExpenseSchema = z.object({
    name: z
        .string({
            required_error: "El nombre del gasto es obligatorio.",
        })
        .min(3, "El nombre del gasto debe tener al menos 3 caracteres."),
    createdById: z.string(),
    amount: z
        .number({
            required_error: "El monto es obligatorio.",
        })
        .refine((val) => val !== 0, {
            message: "El monto no puede ser $0.",
        }),
    participantIds: z
        .array(z.string(), {
            required_error: "Debes agregar al menos 2 participantes al gasto.",
        })
        .min(2, "El gasto debe tener al menos 2 participantes."),
    groupId: z.string().optional(),
});

export const createGroupSchema = z.object({
    name: z
        .string({
            required_error: "El nombre del grupo es obligatorio.",
        })
        .min(3, "El nombre del grupo debe tener al menos 3 caracteres."),
    type: z.nativeEnum(GROUP_TYPE, {
        required_error: "El tipo de grupo es obligatorio.",
        invalid_type_error: "El tipo de grupo no es válido.",
    }),
    createdById: z.string({
        required_error: "El ID del creador es obligatorio.",
    }),
    memberIds: z
        .array(z.string(), {
            required_error: "Debes agregar al menos 2 miembros al grupo.",
        })
        .min(2, "El grupo debe tener al menos 2 miembros."),

});
