import { z } from "zod";

export const authSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type AuthFormValues = z.infer<typeof authSchema>;

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  stock: z.coerce.number().int().min(0, "Stock must be 0 or greater"),
  category_id: z.uuid("Select a category"),
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;
