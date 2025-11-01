"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Save, X } from "lucide-react";
import { useState, useRef, useTransition, useOptimistic } from "react";
import { updateTodo, deleteTodo } from "@/app/actions/todos";
import { toast } from "sonner";
import type { Todo } from "@/lib/schemas";

type TodoItemProps = {
  todo: Todo;
  allTodos: string[];
  // Optimistic UI hooks (optional to keep tests working)
  onOptimisticToggle?: (id: string) => void;
  onRollbackToggle?: (id: string) => void;
  onOptimisticDelete?: (todo: Todo) => void;
  onOptimisticEdit?: (id: string, nextText: string, prevText: string) => void;
  onRollbackEdit?: (id: string, prevText: string) => void;
};

export function TodoItem({
  todo,
  allTodos,
  onOptimisticToggle,
  onRollbackToggle,
  onOptimisticDelete,
  onOptimisticEdit,
  onRollbackEdit,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.text);
  const [editError, setEditError] = useState("");
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const [isPending, startTransition] = useTransition();
  
  // Локальный оптимистичный стейт для чекбокса
  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(
    todo.completed,
    (state, newValue: boolean) => newValue
  );
  
  // Локальный оптимистичный стейт для текста задачи
  const [optimisticText, setOptimisticText] = useOptimistic(
    todo.text,
    (state, newValue: string) => newValue
  );
  
  // Локальный флаг для мгновенного скрытия при удалении (не зависит от optimistic updates)
  const [isHidden, setIsHidden] = useState(false);

  const handleToggle = () => {
    const newValue = !optimisticCompleted;
    
    startTransition(async () => {
      // Мгновенное обновление локального UI
      setOptimisticCompleted(newValue);
      
      const formData = new FormData();
      formData.append("id", todo.id);
      formData.append("completed", newValue.toString());

      // optimistic update для родительского компонента
      onOptimisticToggle?.(todo.id);
      const result = await updateTodo(formData);
      if (!result?.success) {
        // rollback если ошибка
        onRollbackToggle?.(todo.id);
        toast.error(result?.error || "Failed to update todo status");
      }
    });
  };

  const handleDelete = () => {
    let isUndone = false;

    // Мгновенно скрываем элемент из UI
    setIsHidden(true);

    // Показываем toast с кнопкой Undo и прогресс-баром (7 секунд)
    toast.success("Task deleted", {
      duration: 7000,
      action: {
        label: "Undo",
        onClick: () => {
          // Отменяем удаление — сразу показываем задачу обратно
          isUndone = true;
          setIsHidden(false);
        },
      },
      onAutoClose: () => {
        // Вызывается ровно через 7 секунд когда toast закрывается
        if (!isUndone) {
          // Только теперь удаляем из БД и из optimistic state
          startTransition(async () => {
            const formData = new FormData();
            formData.append("id", todo.id);
            const result = await deleteTodo(formData);

            if (result?.success) {
              // Успешное удаление — убираем из родительского списка
              onOptimisticDelete?.(todo);
            } else {
              // Ошибка — возвращаем элемент в UI
              setIsHidden(false);
              toast.error(result?.error || "Failed to delete todo");
            }
          });
        }
      },
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

    // Мгновенное закрытие режима редактирования (это обычный стейт, не оптимистичный)
    setIsEditing(false);
    setEditError("");
    setTimeout(() => editButtonRef.current?.focus(), 0);

    startTransition(async () => {
      // Оптимистичное обновление ВНУТРИ transition
      setOptimisticText(trimmed);
      
      const formData = new FormData();
      formData.append("id", todo.id);
      formData.append("text", trimmed);

      const prevText = todo.text;
      // optimistic text update для родительского компонента
      onOptimisticEdit?.(todo.id, trimmed, prevText);
      const result = await updateTodo(formData);

      if (!result.success) {
        // rollback - возвращаем режим редактирования и старый текст
        setIsEditing(true);
        setEditValue(prevText);
        onRollbackEdit?.(todo.id, prevText);
        setEditError(result.error || "Failed to update todo");
        toast.error(result.error || "Failed to update todo");
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

  // Скрываем элемент если он удален (ожидает 7 секунд или уже удален из БД)
  if (isHidden) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <Checkbox
        checked={optimisticCompleted}
        onCheckedChange={handleToggle}
        aria-label="Toggle todo completion"
      />
      <span
        className={
          optimisticCompleted ? "line-through text-gray-400" : "text-gray-800"
        }
      >
        {optimisticText}
      </span>
      <div className="ml-auto flex gap-1">
        <Button
          ref={editButtonRef}
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(true)}
          aria-label="Edit"
          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          aria-label="Delete"
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
