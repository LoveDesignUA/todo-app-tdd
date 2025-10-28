"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TodoItem } from "./TodoItemWithActions";
import { TodoFilters } from "./TodoFilters";
import type { Todo, Filter } from "@/lib/schemas";

type TodoListClientProps = {
  initialTodos: Todo[];
  initialFilter?: Filter;
};

export function TodoListClient({ initialTodos, initialFilter = "all" }: TodoListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filter, setFilter] = useState<Filter>(initialFilter);

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
    return initialTodos.filter((todo) => {
      if (filter === "active") return !todo.completed;
      if (filter === "completed") return todo.completed;
      return true; // all
    });
  }, [initialTodos, filter]);

  return (
    <div>
      <TodoFilters currentFilter={filter} onFilterChange={handleFilterChange} />

      {filteredTodos.length === 0 && initialTodos.length === 0 ? (
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
              allTodos={initialTodos.map((t) => t.text)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
