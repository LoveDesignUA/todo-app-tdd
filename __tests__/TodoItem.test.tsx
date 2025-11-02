import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoItem } from "../components/TodoItemWithActions";
import { toast } from "sonner";

// Mock Server Actions used by the component
jest.mock("../app/actions/todos", () => ({
  updateTodo: jest.fn(async () => ({ success: true })),
  deleteTodo: jest.fn(async () => ({ success: true })),
}));

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn((message, options) => {
      // Возвращаем mock toast id для тестирования
      return "mock-toast-id";
    }),
  },
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

  test("shows toast with undo when delete button is clicked", async () => {
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

    // С новой логикой undo, deleteTodo вызывается через 7 секунд
    // Проверяем что toast был вызван вместо немедленного удаления
    expect(toast.success).toHaveBeenCalledWith(
      "Task deleted",
      expect.objectContaining({
        duration: 7000,
      })
    );
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

  describe("Undo delete functionality", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("shows toast with undo button when delete is clicked", async () => {
      const mockOnOptimisticDelete = jest.fn();

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
          onOptimisticDelete={mockOnOptimisticDelete}
        />
      );

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      await userEvent.click(deleteButton);

      // Проверяем что toast.success был вызван с правильными параметрами
      expect(toast.success).toHaveBeenCalledWith(
        "Task deleted",
        expect.objectContaining({
          duration: 7000,
          action: expect.objectContaining({
            label: "Undo",
          }),
        })
      );

      // Элемент скрыт сразу (isHidden=true), но onOptimisticDelete НЕ вызван до истечения 7 секунд
      expect(mockOnOptimisticDelete).not.toHaveBeenCalled();

      // Элемент должен исчезнуть из DOM
      expect(screen.queryByText("Buy milk")).not.toBeInTheDocument();
    });

    test("restores todo when undo button is clicked", async () => {
      const mockOnOptimisticDelete = jest.fn();
      let capturedUndoAction: (() => void) | null = null;

      // Перехватываем action.onClick из toast.success
      (toast.success as jest.Mock).mockImplementation((message, options) => {
        if (options?.action?.onClick) {
          capturedUndoAction = options.action.onClick;
        }
        return "mock-toast-id";
      });

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
          onOptimisticDelete={mockOnOptimisticDelete}
        />
      );

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      await userEvent.click(deleteButton);

      // Элемент скрыт после клика
      expect(screen.queryByText("Buy milk")).not.toBeInTheDocument();

      // Симулируем клик на undo кнопку
      expect(capturedUndoAction).not.toBeNull();
      await act(async () => {
        capturedUndoAction!();
      });

      // Элемент должен вернуться в DOM
      await waitFor(() => {
        expect(screen.getByText("Buy milk")).toBeInTheDocument();
      });

      // Проверяем что deleteTodo НЕ был вызван
      expect(deleteTodo).not.toHaveBeenCalled();
    });

    test("calls deleteTodo after 7 seconds via onAutoClose", async () => {
      const mockOnOptimisticDelete = jest.fn();
      let capturedOnAutoClose: (() => void) | null = null;

      // Перехватываем onAutoClose из toast.success
      (toast.success as jest.Mock).mockImplementation((message, options) => {
        if (options?.onAutoClose) {
          capturedOnAutoClose = options.onAutoClose;
        }
        return "mock-toast-id";
      });

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
          onOptimisticDelete={mockOnOptimisticDelete}
        />
      );

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      await userEvent.click(deleteButton);

      // Элемент скрыт сразу
      expect(screen.queryByText("Buy milk")).not.toBeInTheDocument();

      // onOptimisticDelete НЕ вызван до истечения времени
      expect(mockOnOptimisticDelete).not.toHaveBeenCalled();

      // Проверяем что toast был вызван с 7 секундным таймером
      expect(toast.success).toHaveBeenCalledWith(
        "Task deleted",
        expect.objectContaining({
          duration: 7000,
        })
      );

      // Симулируем автозакрытие toast через 7 секунд
      expect(capturedOnAutoClose).not.toBeNull();
      await act(async () => {
        capturedOnAutoClose!();
      });

      // Теперь deleteTodo должен быть вызван
      await waitFor(() => {
        expect(deleteTodo).toHaveBeenCalledWith(
          expect.objectContaining({
            get: expect.any(Function),
          })
        );
      });

      // И onOptimisticDelete вызван после успешного удаления
      await waitFor(() => {
        expect(mockOnOptimisticDelete).toHaveBeenCalledWith(
          expect.objectContaining({
            id: "550e8400-e29b-41d4-a716-446655440000",
          })
        );
      });
    });

    test("hides element immediately but delays optimistic delete until success", async () => {
      const mockOnOptimisticDelete = jest.fn();

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
          onOptimisticDelete={mockOnOptimisticDelete}
        />
      );

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      await userEvent.click(deleteButton);

      // Элемент скрыт сразу из UI
      expect(screen.queryByText("Buy milk")).not.toBeInTheDocument();

      // Но onOptimisticDelete НЕ вызван до завершения 7 секунд
      expect(mockOnOptimisticDelete).not.toHaveBeenCalled();
    });
  });
});
