import { z } from "zod";

import { ExpenseType } from "@prisma/client";

import { EXPENSE_TYPE } from "@/components/ExpenseTypeSelect/constants";

/* Rules */
const name = z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede superar los 50 caracteres.")
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
const token = z
    .string({
        required_error: "El token es requerido",
        invalid_type_error: "El token debe ser un string",
    })
    .min(10, "El token es inválido");
const id = z.string();
/* End of rules */

/* Form schemes without authentication */
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

export const resetPasswordSchema = z.object({
    password,
    token,
});
/* End of form schemes without authentication */

/* User form schemas */
export const getUserSchema = z.object({
    id,
});

export const updateUserSchema = z.object({
    id,
    name,
    password: z.union([
        z.literal(""),
        z
            .string()
            .min(6, "La contraseña debe tener al menos 6 caracteres")
            .regex(/[A-Za-z]/, "La contraseña debe contener al menos una letra")
            .regex(/[0-9]/, "La contraseña debe contener al menos un número"),
    ]),
    currentPassword: z
        .string()
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .regex(/[A-Za-z]/, "La contraseña debe contener al menos una letra")
        .regex(/[0-9]/, "La contraseña debe contener al menos un número")
        .optional(),
});

export const deleteUserSchema = z.object({
    id,
    password,
});

export const userSchema = z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().nullable(),
    image: z.string().nullable(),
});
/* End of user form schemas  */

/* Form schemes for expenses */
export const createExpenseSchema = z.object({
    name: z
        .string({
            required_error: "El nombre del gasto es obligatorio.",
        })
        .min(3, "El nombre del gasto debe tener al menos 3 caracteres.")
        .max(50, "El nombre del gasto no puede superar los 50 caracteres."),
    paidById: id,
    participantIds: z
        .array(z.string(), {
            required_error: "Debes agregar al menos 2 participantes al gasto.",
        })
        .min(2, "El gasto debe tener al menos 2 participantes.").max(20),
    amount: z
        .number({
            required_error: "El monto es obligatorio.",
        })
        .max(1_000_000_000, {
            message: "El monto no puede ser mayor a $1.000.000.000",
        })
        .refine((val) => val !== 0, {
            message: "El monto no puede ser $0.",
        }),
    type: z.nativeEnum(EXPENSE_TYPE).optional(),
    groupId: z.string().nullable().optional(),
});

export const createGroupSchema = z.object({
    name: z
        .string({
            required_error: "El nombre del grupo es obligatorio.",
        })
        .min(3, "El nombre del grupo debe tener al menos 3 caracteres."),
    type: z.nativeEnum(ExpenseType, {
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
