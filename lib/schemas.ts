import { z } from "zod";

// Zod схемы для валидации
export const todoSchema = z.object({
  id: z.uuidv4(),
  text: z
    .string()
    .min(1, "Todo cannot be empty")
    .trim(),
  completed: z.boolean(),
  user_id: z.uuidv4(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const createTodoSchema = z.object({
  text: z
    .string()
    .min(1, "Todo cannot be empty")
    .trim(),
});

export const updateTodoSchema = z.object({
  id: z.uuidv4(),
  text: z
    .string()
    .min(1, "Todo cannot be empty")
    .trim()
    .optional(),
  completed: z.boolean().optional(),
});

export const deleteTodoSchema = z.object({
  id: z.uuidv4(),
});

// Filter schema for URL/state
export const filterSchema = z.enum(["all", "active", "completed"]);
export type Filter = z.infer<typeof filterSchema>;

// Auth schemas
export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

export type Todo = z.infer<typeof todoSchema>;
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type DeleteTodoInput = z.infer<typeof deleteTodoSchema>;
