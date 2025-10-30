"use client";

import { useMemo, useOptimistic, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TodoItem } from "./TodoItemWithActions";
import { TodoFilters } from "./TodoFilters";
import type { Todo, Filter } from "@/lib/schemas";
import { AddTodoForm } from "./AddTodoForm";
import { createTodo } from "@/app/actions/todos";
import { toast } from "sonner";

type TodoListClientProps = {
  initialTodos: Todo[];
  initialFilter?: Filter;
};

type OptimisticAction =
  | { type: "toggle"; id: string }
  | { type: "delete"; todo: Todo }
  | { type: "edit"; id: string; text: string }
  | { type: "add-back"; todo: Todo }
  | { type: "add"; todo: Todo }
  | { type: "replace"; id: string; next: Todo }
  | { type: "remove"; id: string };

export function TodoListClient({ initialTodos, initialFilter = "all" }: TodoListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [optimisticTodos, dispatchOptimistic] = useOptimistic<Todo[], OptimisticAction>(
    initialTodos,
    (state, action) => {
      switch (action.type) {
        case "add":
          return [action.todo, ...state];
        case "replace":
          return state.map((t) => (t.id === action.id ? action.next : t));
        case "remove":
          return state.filter((t) => t.id !== action.id);
        case "toggle":
          return state.map((t) =>
            t.id === action.id ? { ...t, completed: !t.completed } : t
          );
        case "delete":
          return state.filter((t) => t.id !== action.todo.id);
        case "edit":
          return state.map((t) => (t.id === action.id ? { ...t, text: action.text } : t));
        case "add-back":
          // re-add at the top for visibility
          return [action.todo, ...state];
        default:
          return state;
      }
    }
  );

  // Обновляем URL при смене фильтра
  const handleFilterChange = (next: Filter) => {
    setFilter(next);

    const params = new URLSearchParams(searchParams?.toString());
    if (next === "all") {
      params.delete("filter");
    } else {
      params.set("filter", next);
    }
    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    router.replace(nextUrl);
  };

  const filteredTodos = useMemo(() => {
    return optimisticTodos.filter((todo) => {
      if (filter === "active") return !todo.completed;
      if (filter === "completed") return todo.completed;
      return true; // all
    });
  }, [optimisticTodos, filter]);

  // Optimistic handlers invoked from child
  const onOptimisticToggle = (id: string) => dispatchOptimistic({ type: "toggle", id });
  const onRollbackToggle = (id: string) => dispatchOptimistic({ type: "toggle", id });

  const onOptimisticDelete = (todo: Todo) => dispatchOptimistic({ type: "delete", todo });
  const onRollbackDelete = (todo: Todo) => dispatchOptimistic({ type: "add-back", todo });

  const onOptimisticEdit = (id: string, text: string) =>
    dispatchOptimistic({ type: "edit", id, text });
  const onRollbackEdit = (id: string, prevText: string) =>
    dispatchOptimistic({ type: "edit", id, text: prevText });

  // Optimistic create
  const onOptimisticCreate = async (text: string) => {
    const now = new Date().toISOString();
    const tempId = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
    const temp: Todo = {
      id: `tmp-${tempId}`,
      text,
      completed: false,
      user_id: "temp-user",
      created_at: now,
      updated_at: now,
    };

    dispatchOptimistic({ type: "add", todo: temp });

    const fd = new FormData();
    fd.append("text", text);
    const result = await createTodo(fd);

    if (result.success && result.data) {
      dispatchOptimistic({ type: "replace", id: temp.id, next: result.data as Todo });
      return { success: true as const };
    } else {
      dispatchOptimistic({ type: "remove", id: temp.id });
      toast.error(result.error || "Failed to create todo");
      return { success: false as const, error: result.error || "Failed to create todo" };
    }
  };

  return (
    <div>
      <AddTodoForm
        allTodos={optimisticTodos.map((t) => t.text)}
        onOptimisticCreate={onOptimisticCreate}
      />
      <TodoFilters currentFilter={filter} onFilterChange={handleFilterChange} />

      {filteredTodos.length === 0 && optimisticTodos.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No todos yet. Add one above!
        </p>
      ) : filteredTodos.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No {filter} todos found.
        </p>
      ) : (
        <div className="space-y-2">
          {filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              allTodos={optimisticTodos.map((t) => t.text)}
              onOptimisticToggle={onOptimisticToggle}
              onRollbackToggle={onRollbackToggle}
              onOptimisticDelete={onOptimisticDelete}
              onRollbackDelete={onRollbackDelete}
              onOptimisticEdit={onOptimisticEdit}
              onRollbackEdit={onRollbackEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
