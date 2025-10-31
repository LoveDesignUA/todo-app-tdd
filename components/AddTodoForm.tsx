"use client";

import { useRef, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTodo } from "@/app/actions/todos";

type AddTodoFormProps = {
  allTodos: string[];
  onOptimisticCreate?: (
    text: string
  ) => Promise<{ success: boolean; error?: string }>;
};

export function AddTodoForm({
  allTodos,
  onOptimisticCreate,
}: AddTodoFormProps) {
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    const text = formData.get("text") as string;

    // Клиентская валидация для быстрой обратной связи
    if (!text.trim()) {
      setError("Todo cannot be empty");
      return;
    }

    // Проверка дубликатов на клиенте
    const isDuplicate = allTodos.some(
      (todo) => todo.toLowerCase() === text.trim().toLowerCase()
    );

    if (isDuplicate) {
      setError("This todo already exists!");
      return;
    }

    setError("");

    // Мгновенная очистка формы для лучшего UX
    const trimmedText = text.trim();
    formRef.current?.reset();

    startTransition(async () => {
      if (onOptimisticCreate) {
        const res = await onOptimisticCreate(trimmedText);
        if (!res.success) {
          setError(res.error || "Failed to create todo");
          // Возвращаем текст обратно в форму при ошибке
          if (formRef.current) {
            const input = formRef.current.elements.namedItem(
              "text"
            ) as HTMLInputElement;
            if (input) input.value = trimmedText;
          }
        }
      } else {
        const fd = new FormData();
        fd.append("text", trimmedText);
        const result = await createTodo(fd);
        if (!result.success) {
          setError(result.error || "Failed to create todo");
          // Возвращаем текст обратно в форму при ошибке
          if (formRef.current) {
            const input = formRef.current.elements.namedItem(
              "text"
            ) as HTMLInputElement;
            if (input) input.value = trimmedText;
          }
        }
      }
    });
  };

  return (
    <div>
      <form ref={formRef} action={handleSubmit} className="flex gap-2 mb-6">
        <Input
          type="text"
          name="text"
          placeholder="Add a new todo..."
          className="flex-1"
          onChange={() => setError("")}
        />
        <Button type="submit">Add</Button>
      </form>

      {error && (
        <div
          role="alert"
          className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded"
        >
          {error}
        </div>
      )}
    </div>
  );
}
