import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddTodoForm } from "../components/AddTodoForm";
import { TodoListClient } from "../components/TodoListClient";

// Mock Server Actions for AddTodoForm
jest.mock("../app/actions/todos", () => ({
  createTodo: jest.fn(async () => ({ success: true })),
}));

// Mock next/navigation for URL sync tests
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

import { createTodo } from "../app/actions/todos";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

describe("Todo List (client composition)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // default mocks for next/navigation used by TodoListClient
    (useRouter as jest.Mock).mockReturnValue({ replace: jest.fn() });
    (usePathname as jest.Mock).mockReturnValue("/");
    (useSearchParams as jest.Mock).mockReturnValue({ toString: () => "" });
  });

  const getInput = () => screen.getByPlaceholderText(/add a new todo/i);
  const getAddButton = () => screen.getByRole("button", { name: /add/i });

  test("shows empty state when no todos", () => {
    render(<TodoListClient initialTodos={[]} />);

    expect(
      screen.getByText(/no todos yet\. add one above!/i)
    ).toBeInTheDocument();
  });

  test("filters: active and completed", async () => {
    const mockUserId = "user-123-uuid";
    render(
      <TodoListClient
        initialTodos={[
          {
            id: "11111111-1111-1111-1111-111111111111",
            text: "Buy milk",
            completed: true,
            user_id: mockUserId,
            created_at: "2025-10-28T10:00:00Z",
            updated_at: "2025-10-28T10:00:00Z",
          },
          {
            id: "22222222-2222-2222-2222-222222222222",
            text: "Write tests",
            completed: false,
            user_id: mockUserId,
            created_at: "2025-10-28T10:00:00Z",
            updated_at: "2025-10-28T10:00:00Z",
          },
        ]}
      />
    );

    // Default All shows both
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(screen.getByText("Write tests")).toBeInTheDocument();

    // Active
    const activeBtn = screen.getByRole("button", { name: /active/i });
    await userEvent.click(activeBtn);
    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument();
    expect(screen.getByText("Write tests")).toBeInTheDocument();

    // Completed
    const completedBtn = screen.getByRole("button", { name: /completed/i });
    await userEvent.click(completedBtn);
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(screen.queryByText("Write tests")).not.toBeInTheDocument();
  });

  test("filters: aria-current on active button", async () => {
    const mockUserId = "user-123-uuid";
    render(
      <TodoListClient
        initialTodos={[
          {
            id: "11111111-1111-1111-1111-111111111111",
            text: "Buy milk",
            completed: false,
            user_id: mockUserId,
            created_at: "2025-10-28T10:00:00Z",
            updated_at: "2025-10-28T10:00:00Z",
          },
        ]}
      />
    );

    const allBtn = screen.getByRole("button", { name: /^all$/i });
    expect(allBtn).toHaveAttribute("aria-current", "page");

    const activeBtn = screen.getByRole("button", { name: /active/i });
    await userEvent.click(activeBtn);
    expect(activeBtn).toHaveAttribute("aria-current", "page");
    expect(allBtn).not.toHaveAttribute("aria-current");
  });

  test("updates URL when filter changes", async () => {
    const mockUserId = "user-123-uuid";
    const replace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ replace });
    (usePathname as jest.Mock).mockReturnValue("/");
    (useSearchParams as jest.Mock).mockReturnValue({ toString: () => "" });

    render(
      <TodoListClient
        initialTodos={[
          {
            id: "11111111-1111-1111-1111-111111111111",
            text: "Buy milk",
            completed: false,
            user_id: mockUserId,
            created_at: "2025-10-28T10:00:00Z",
            updated_at: "2025-10-28T10:00:00Z",
          },
        ]}
      />
    );

    const activeBtn = screen.getByRole("button", { name: /active/i });
    await userEvent.click(activeBtn);
    expect(replace).toHaveBeenCalledWith("/?filter=active");

    const completedBtn = screen.getByRole("button", { name: /completed/i });
    await userEvent.click(completedBtn);
    expect(replace).toHaveBeenCalledWith("/?filter=completed");

    const allBtn = screen.getByRole("button", { name: /^all$/i });
    await userEvent.click(allBtn);
    expect(replace).toHaveBeenCalledWith("/");
  });

  test("AddTodoForm: blocks empty and duplicate, submits valid and resets", async () => {
    render(<AddTodoForm allTodos={["Buy milk"]} />);

    // Empty
    await userEvent.click(getAddButton());
    expect(screen.getByRole("alert")).toHaveTextContent(/cannot be empty/i);

    // Duplicate
    await userEvent.type(getInput(), "Buy milk");
    await userEvent.click(getAddButton());
    expect(screen.getByRole("alert")).toHaveTextContent(/already exists/i);

    // Valid
    const input = getInput();
    await userEvent.clear(input);
    await userEvent.type(input, "Write tests");
    await userEvent.click(getAddButton());

    expect(createTodo).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue("");
  });
});
