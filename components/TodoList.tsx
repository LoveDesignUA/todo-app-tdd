"use client";

import { useState, useEffect } from "react";
import { TodoItem } from "./TodoItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase, Todo as SupabaseTodo } from "@/lib/supabase";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

type Filter = "all" | "active" | "completed";

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка todos из Supabase при монтировании
  useEffect(() => {
    const fetchTodos = async () => {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError("Failed to load todos. Please try again.");
        setIsLoading(false);
        return;
      }

      if (data) {
        const mappedTodos: Todo[] = data.map((todo: SupabaseTodo) => ({
          id: todo.id,
          text: todo.text,
          completed: todo.completed,
        }));
        setTodos(mappedTodos);
      }
      setIsLoading(false);
    };

    fetchTodos();
  }, []);

  const handleAddTodo = () => {
    if (inputValue.trim() === "") return;

    // Проверка на дубликаты
    const isDuplicate = todos.some(
      (todo) => todo.text.toLowerCase() === inputValue.trim().toLowerCase()
    );

    if (isDuplicate) {
      setError("This todo already exists!");
      return;
    }

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
    };

    setTodos([...todos, newTodo]);
    setInputValue("");
    setError("");
  };

  const handleToggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTodo();
    }
  };

  // Фильтрация задач
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true; // all
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Todo List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <Input
            type="text"
            placeholder="Add a new todo..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleAddTodo}>Add</Button>
        </div>

        {error && (
          <div
            role="alert"
            className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded"
          >
            {error}
          </div>
        )}

        {/* Фильтры */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            aria-current={filter === "all" ? "page" : undefined}
          >
            All
          </Button>
          <Button
            variant={filter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("active")}
            aria-current={filter === "active" ? "page" : undefined}
          >
            Active
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("completed")}
            aria-current={filter === "completed" ? "page" : undefined}
          >
            Completed
          </Button>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500 py-8">Loading...</p>
        ) : filteredTodos.length === 0 && todos.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No todos yet. Add one above!
          </p>
        ) : filteredTodos.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No {filter} todos found.
          </p>
        ) : (
          <div className="space-y-2">
            {filteredTodos.map(({ id, text, completed }) => (
              <TodoItem
                key={id}
                text={text}
                completed={completed}
                onToggle={() => handleToggleTodo(id)}
                onDelete={() => handleDeleteTodo(id)}
                onEdit={(newText) => {
                  setTodos(
                    todos.map((todo) =>
                      todo.id === id ? { ...todo, text: newText } : todo
                    )
                  );
                }}
                allTodos={todos.map((t) => t.text)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
