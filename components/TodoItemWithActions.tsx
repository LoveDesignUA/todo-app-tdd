"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Save, X } from "lucide-react";
import { useState, useRef, useTransition } from "react";
import { updateTodo, deleteTodo } from "@/app/actions/todos";
import type { Todo } from "@/lib/schemas";

type TodoItemProps = {
  todo: Todo;
  allTodos: string[];
};

export function TodoItem({ todo, allTodos }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.text);
  const [editError, setEditError] = useState("");
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", todo.id);
      formData.append("completed", (!todo.completed).toString());

      await updateTodo(formData);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", todo.id);

      await deleteTodo(formData);
    });
  };

  const handleSave = async () => {
    const trimmed = editValue.trim();

    // Валидация: пустой текст
    if (!trimmed) {
      setEditError("Todo cannot be empty!");
      return;
    }

    // Валидация: дубликаты (игнорируем текущую задачу)
    const isDuplicate = allTodos.some(
      (todoText) =>
        todoText.toLowerCase() !== todo.text.toLowerCase() &&
        todoText.toLowerCase() === trimmed.toLowerCase()
    );

    if (isDuplicate) {
      setEditError("This todo already exists!");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", todo.id);
      formData.append("text", trimmed);

      const result = await updateTodo(formData);

      if (result.success) {
        setIsEditing(false);
        setEditError("");
        setTimeout(() => editButtonRef.current?.focus(), 0);
      } else {
        setEditError(result.error || "Failed to update todo");
      }
    });
  };

  const handleCancel = () => {
    setEditValue(todo.text);
    setIsEditing(false);
    setEditError("");
    setTimeout(() => editButtonRef.current?.focus(), 0);
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 p-3 bg-white rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <Input
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              setEditError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            className="flex-1"
            autoFocus
            disabled={isPending}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            aria-label="Save"
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            disabled={isPending}
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            aria-label="Cancel"
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            disabled={isPending}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {editError && (
          <div className="text-red-500 text-sm px-2">{editError}</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <Checkbox
        checked={todo.completed}
        onCheckedChange={handleToggle}
        aria-label="Toggle todo completion"
        disabled={isPending}
      />
      <span
        className={
          todo.completed ? "line-through text-gray-400" : "text-gray-800"
        }
      >
        {todo.text}
      </span>
      <div className="ml-auto flex gap-1">
        <Button
          ref={editButtonRef}
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(true)}
          aria-label="Edit"
          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
          disabled={isPending}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          aria-label="Delete"
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
          disabled={isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
