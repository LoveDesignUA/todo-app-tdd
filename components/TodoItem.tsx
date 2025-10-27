import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Save, X } from "lucide-react";
import { useState, useRef } from "react";

type TodoItemProps = {
  text: string;
  completed: boolean;
  onDelete?: () => void;
  onToggle?: () => void;
  onEdit?: (newText: string) => void;
  allTodos?: string[]; // Список всех задач для проверки дубликатов
};

export function TodoItem({
  text,
  completed,
  onDelete,
  onToggle,
  onEdit,
  allTodos = [],
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(text);
  const [editError, setEditError] = useState("");
  const editButtonRef = useRef<HTMLButtonElement>(null);

  const handleSave = () => {
    const trimmed = editValue.trim();

    // Валидация: пустой текст
    if (!trimmed) {
      setEditError("Todo cannot be empty!");
      return;
    }

    // Валидация: дубликаты (игнорируем текущую задачу)
    const isDuplicate = allTodos.some(
      (todo) =>
        todo.toLowerCase() !== text.toLowerCase() &&
        todo.toLowerCase() === trimmed.toLowerCase()
    );

    if (isDuplicate) {
      setEditError("This todo already exists!");
      return;
    }

    if (onEdit) {
      onEdit(trimmed);
      setIsEditing(false);
      setEditError("");
      // Возвращаем фокус на кнопку Edit после сохранения
      setTimeout(() => editButtonRef.current?.focus(), 0);
    }
  };

  const handleCancel = () => {
    setEditValue(text);
    setIsEditing(false);
    setEditError("");
    // Возвращаем фокус на кнопку Edit после отмены
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
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            aria-label="Save"
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            aria-label="Cancel"
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
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
        checked={completed}
        onCheckedChange={onToggle}
        aria-label="Toggle todo completion"
      />
      <span
        className={completed ? "line-through text-gray-400" : "text-gray-800"}
      >
        {text}
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
          onClick={onDelete}
          aria-label="Delete"
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
