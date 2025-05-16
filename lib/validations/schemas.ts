import { z } from "zod";

// Rules
const name = z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .refine(
        (val) =>
            val
                .trim()
                .split(" ")
                .every((word) => /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/.test(word)),
        {
            message: "Cada nombre debe comenzar con mayúscula",
        }
    );
const email = z.string().email("El correo electrónico no es válido");
const password = z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .regex(/[A-Za-z]/, "La contraseña debe contener al menos una letra")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número");

// Schemas
export const registerSchema = z.object({
    name,
    email,
    password,
});

export const loginSchema = z.object({
    email,
    password,
});

export const forgotPasswordSchema = z.object({
    email,
});

export const resetPasswordSchema = z.object({
    password,
});

