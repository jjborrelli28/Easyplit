import { z } from "zod";

// Rules
const alias = z.string().min(3, "El alias debe tener al menos 3 caracteres");
const email = z.string().email("El correo electrónico no es válido");
const password = z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .regex(/[A-Za-z]/, "La contraseña debe contener al menos una letra")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número");

// Schemas
export const registerSchema = z.object({
    alias,
    email,
    password,
});

export const loginSchema = z.object({
    email,
    password,
});
