"use client";

import { useRef, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTodo } from "@/app/actions/todos";

type AddTodoFormProps = {
  allTodos: string[];
};

export function AddTodoForm({ allTodos }: AddTodoFormProps) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
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

    startTransition(async () => {
      const result = await createTodo(formData);

      if (!result.success) {
        setError(result.error || "Failed to create todo");
      } else {
        // Очищаем форму через React ref
        formRef.current?.reset();
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
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding..." : "Add"}
        </Button>
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
