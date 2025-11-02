"use client";

import { useEffect, useMemo, useOptimistic, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TodoItem } from "./TodoItemWithActions";
import { TodoFilters } from "./TodoFilters";
import type { Todo, Filter } from "@/lib/schemas";
import { AddTodoForm } from "./AddTodoForm";
import { createTodo } from "@/app/actions/todos";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type TodoListClientProps = {
  initialTodos: Todo[];
  initialFilter?: Filter;
};

type OptimisticAction =
  | { type: "toggle"; payload: { id: string } }
  | { type: "delete"; payload: { todo: Todo } }
  | { type: "edit"; payload: { id: string; text: string } }
  | { type: "add-back"; payload: { todo: Todo } }
  | { type: "add"; payload: { todo: Todo } }
  | { type: "replace"; payload: { id: string; next: Todo } }
  | { type: "remove"; payload: { id: string } };

export function TodoListClient({ initialTodos, initialFilter = "all" }: TodoListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filter, setFilter] = useState<Filter>(initialFilter);
  
  // const [userId, setUserId] = useState<string | null>(null);

  // Fetch current user id from session for accurate optimistic user_id
  // useEffect(() => {
  //   const abortController = new AbortController();
    
  //   (async () => {
  //     try {
  //       const { data } = await supabase.auth.getUser();
  //       if (!abortController.signal.aborted) {
  //         setUserId(data.user?.id ?? null);
  //       }
  //     } catch (error) {
  //       console.log("Error fetching user:", error);
  //       if (!abortController.signal.aborted) {
  //         setUserId(null);
  //       }
  //     }
  //   })();
    
  //   return () => abortController.abort();
  // }, []);

  const [optimisticTodos, dispatchOptimistic] = useOptimistic<Todo[], OptimisticAction>(
    initialTodos,
    (state, action) => {
      switch (action.type) {
        // Добавляет временную задачу с tmp-{uuid} ID при создании
        case "add":
          return [action.payload.todo, ...state];
        
        // Заменяет временную задачу на реальную после успешного ответа сервера
        case "replace":
          return state.map((t) => (t.id === action.payload.id ? action.payload.next : t));
        
        // Удаляет временную задачу при ошибке создания
        case "remove":
          return state.filter((t) => t.id !== action.payload.id);
        
        // Переключает статус completed (используется для optimistic update и rollback)
        case "toggle":
          return state.map((t) =>
            t.id === action.payload.id ? { ...t, completed: !t.completed } : t
          );
        
        // Удаляет задачу оптимистично при клике на Delete
        case "delete":
          return state.filter((t) => t.id !== action.payload.todo.id);
        
        // Обновляет текст задачи (используется для optimistic edit и rollback)
        case "edit":
          return state.map((t) => (t.id === action.payload.id ? { ...t, text: action.payload.text } : t));
        
        // Откатывает удаление - возвращает задачу обратно при ошибке
        case "add-back":
          return [action.payload.todo, ...state];
        
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
  const onOptimisticToggle = (id: string) => dispatchOptimistic({ type: "toggle", payload: { id } });
  const onRollbackToggle = (id: string) => dispatchOptimistic({ type: "toggle", payload: { id } });

  const onOptimisticDelete = (todo: Todo) => dispatchOptimistic({ type: "delete", payload: { todo } });
  const onRollbackDelete = (todo: Todo) => dispatchOptimistic({ type: "add-back", payload: { todo } });

  const onOptimisticEdit = (id: string, text: string) =>
    dispatchOptimistic({ type: "edit", payload: { id, text } });
  const onRollbackEdit = (id: string, prevText: string) =>
    dispatchOptimistic({ type: "edit", payload: { id, text: prevText } });

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
      // user_id: userId ?? "temp-user",
      user_id: "temp-user",
      created_at: now,
      updated_at: now,
    };

  dispatchOptimistic({ type: "add", payload: { todo: temp } });

    const fd = new FormData();
    fd.append("text", text);
    const result = await createTodo(fd);

    if (result.success && result.data) {
      dispatchOptimistic({ type: "replace", payload: { id: temp.id, next: result.data as Todo } });
      return { success: true as const };
    } else {
      dispatchOptimistic({ type: "remove", payload: { id: temp.id } });
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
              onOptimisticEdit={onOptimisticEdit}
              onRollbackEdit={onRollbackEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
