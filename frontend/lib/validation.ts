import { z } from "zod";

export const authSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type AuthFormValues = z.infer<typeof authSchema>;
