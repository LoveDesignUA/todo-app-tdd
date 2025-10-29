"use server";

import { supabase } from "@/lib/supabase";
import {
  createTodoSchema,
  updateTodoSchema,
  deleteTodoSchema,
  type Todo,
} from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

// Получить все todos для текущего пользователя
export async function getTodos(): Promise<ActionResult<Todo[]>> {
  try {
    // Получить текущего пользователя
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized. Please sign in.",
      };
    }

    // RLS автоматически фильтрует по user_id
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: "Failed to load todos. Please try again.",
      };
    }

    return {
      success: true,
      data: data as Todo[],
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

// Создать новый todo
export async function createTodo(
  formData: FormData
): Promise<ActionResult<Todo>> {
  try {
    // Получить текущего пользователя
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized. Please sign in.",
      };
    }

    const text = formData.get("text") as string;

    // Валидация с Zod
    const validatedData = createTodoSchema.parse({ text });

    // Проверка на дубликаты у текущего пользователя
    const { data: existingTodos } = await supabase
      .from("todos")
      .select("text")
      .ilike("text", validatedData.text);

    if (existingTodos && existingTodos.length > 0) {
      return {
        success: false,
        error: "This todo already exists!",
      };
    }

    // Создание todo с user_id
    const { data, error } = await supabase
      .from("todos")
      .insert({
        text: validatedData.text,
        completed: false,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: "Failed to create todo",
      };
    }

    revalidatePath("/");

    return {
      success: true,
      data: data as Todo,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

// Обновить todo
export async function updateTodo(
  formData: FormData
): Promise<ActionResult<Todo>> {
  try {
    // Получить текущего пользователя
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized. Please sign in.",
      };
    }

    const id = formData.get("id") as string;
    const text = formData.get("text") as string | null;
    const completed = formData.get("completed") as string | null;

    const updateData: { id: string; text?: string; completed?: boolean } = {
      id,
    };

    if (text !== null) updateData.text = text;
    if (completed !== null) updateData.completed = completed === "true";

    // Валидация с Zod
    const validatedData = updateTodoSchema.parse(updateData);

    // Если обновляется текст, проверяем на дубликаты
    if (validatedData.text) {
      const { data: existingTodos } = await supabase
        .from("todos")
        .select("id, text")
        .ilike("text", validatedData.text)
        .neq("id", validatedData.id);

      if (existingTodos && existingTodos.length > 0) {
        return {
          success: false,
          error: "This todo already exists!",
        };
      }
    }

    // Обновление
    const { data, error } = await supabase
      .from("todos")
      .update({
        ...(validatedData.text && { text: validatedData.text }),
        ...(validatedData.completed !== undefined && {
          completed: validatedData.completed,
        }),
      })
      .eq("id", validatedData.id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: "Failed to update todo",
      };
    }

    revalidatePath("/");

    return {
      success: true,
      data: data as Todo,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

// Удалить todo
export async function deleteTodo(
  formData: FormData
): Promise<ActionResult<void>> {
  try {
    // Получить текущего пользователя
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized. Please sign in.",
      };
    }

    const id = formData.get("id") as string;

    // Валидация с Zod
    const validatedData = deleteTodoSchema.parse({ id });

    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("id", validatedData.id);

    if (error) {
      return {
        success: false,
        error: "Failed to delete todo",
      };
    }

    revalidatePath("/");

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
