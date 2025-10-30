import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoItem } from "../components/TodoItemWithActions";

// Mock Server Actions used by the component
jest.mock("../app/actions/todos", () => ({
  updateTodo: jest.fn(async () => ({ success: true })),
  deleteTodo: jest.fn(async () => ({ success: true })),
}));

import { updateTodo, deleteTodo } from "../app/actions/todos";

describe("TodoItemWithActions (client)", () => {
  test("renders todo text", () => {
    render(
      <TodoItem
        todo={{
          id: "550e8400-e29b-41d4-a716-446655440000",
          text: "Buy milk",
          completed: false,
          user_id: "user-123-uuid",
          created_at: "2025-10-28T10:00:00Z",
          updated_at: "2025-10-28T10:00:00Z",
        }}
        allTodos={["Buy milk"]}
      />
    );

    const todoText = screen.getByText("Buy milk");
    expect(todoText).toBeInTheDocument();
  });

  test("shows completed state with line-through", () => {
    render(
      <TodoItem
        todo={{
          id: "550e8400-e29b-41d4-a716-446655440000",
          text: "Buy milk",
          completed: true,
          user_id: "user-123-uuid",
          created_at: "2025-10-28T10:00:00Z",
          updated_at: "2025-10-28T10:00:00Z",
        }}
        allTodos={["Buy milk"]}
      />
    );

    const todoText = screen.getByText("Buy milk");
    expect(todoText).toHaveClass("line-through");
  });

  test("calls delete server action when delete button is clicked", async () => {
    render(
      <TodoItem
        todo={{
          id: "550e8400-e29b-41d4-a716-446655440000",
          text: "Buy milk",
          completed: false,
          user_id: "user-123-uuid",
          created_at: "2025-10-28T10:00:00Z",
          updated_at: "2025-10-28T10:00:00Z",
        }}
        allTodos={["Buy milk"]}
      />
    );

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await userEvent.click(deleteButton);

    expect(deleteTodo).toHaveBeenCalledTimes(1);
    // Проверяем что передан FormData с правильным ID
    const callArg = (deleteTodo as jest.Mock).mock.calls[0][0];
    expect(callArg).toBeInstanceOf(FormData);
    expect(callArg.get("id")).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  test("calls update server action when checkbox is clicked", async () => {
    render(
      <TodoItem
        todo={{
          id: "550e8400-e29b-41d4-a716-446655440000",
          text: "Buy milk",
          completed: false,
          user_id: "user-123-uuid",
          created_at: "2025-10-28T10:00:00Z",
          updated_at: "2025-10-28T10:00:00Z",
        }}
        allTodos={["Buy milk"]}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);

    expect(updateTodo).toHaveBeenCalledTimes(1);
  });

  test("checkbox is checked when todo is completed", () => {
    render(
      <TodoItem
        todo={{
          id: "550e8400-e29b-41d4-a716-446655440000",
          text: "Buy milk",
          completed: true,
          user_id: "user-123-uuid",
          created_at: "2025-10-28T10:00:00Z",
          updated_at: "2025-10-28T10:00:00Z",
        }}
        allTodos={["Buy milk"]}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-checked", "true");
  });

  test("checkbox is unchecked when todo is not completed", () => {
    render(
      <TodoItem
        todo={{
          id: "550e8400-e29b-41d4-a716-446655440000",
          text: "Buy milk",
          completed: false,
          user_id: "user-123-uuid",
          created_at: "2025-10-28T10:00:00Z",
          updated_at: "2025-10-28T10:00:00Z",
        }}
        allTodos={["Buy milk"]}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-checked", "false");
  });
});
