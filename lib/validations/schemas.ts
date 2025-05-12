import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("El email no es válido"),
    password: z
        .string()
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .regex(/[A-Za-z]/, "La contraseña debe contener al menos una letra")
        .regex(/[0-9]/, "La contraseña debe contener al menos un número"),
});
