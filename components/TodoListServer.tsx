import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTodos } from "@/app/actions/todos";
import { AddTodoForm } from "./AddTodoForm";
import { TodoListClient } from "./TodoListClient";
import type { Filter } from "@/lib/schemas";

export async function TodoListServer(
  {
    initialFilter = "all",
  }: {
    initialFilter?: Filter;
  } = {}
) {
  const result = await getTodos();

  if (!result.success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Todo List</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            role="alert"
            className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded"
          >
            {result.error || "Failed to load todos"}
          </div>
        </CardContent>
      </Card>
    );
  }

  const todos = result.data || [];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Todo List</CardTitle>
      </CardHeader>
      <CardContent>
        <AddTodoForm allTodos={todos.map((t) => t.text)} />
        <TodoListClient initialTodos={todos} initialFilter={initialFilter} />
      </CardContent>
    </Card>
  );
}
