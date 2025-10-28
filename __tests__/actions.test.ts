import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../app/actions/todos";
import { supabase } from "../lib/supabase";

// Mock Supabase client
jest.mock("../lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock next/cache
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("Server Actions for Todos", () => {
  const mockSupabase = supabase as jest.Mocked<typeof supabase>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getTodos", () => {
    test("successfully fetches todos from database", async () => {
      const mockTodos = [
        {
          id: "1",
          text: "Buy milk",
          completed: false,
          created_at: "2025-10-28T10:00:00Z",
          updated_at: "2025-10-28T10:00:00Z",
        },
      ];

      mockSupabase.from.mockReturnValue(({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockTodos,
            error: null,
          }),
        }),
      } as unknown) as ReturnType<typeof mockSupabase.from>);

      const result = await getTodos();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTodos);
      expect(mockSupabase.from).toHaveBeenCalledWith("todos");
    });

    test("handles database error", async () => {
      mockSupabase.from.mockReturnValue(({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
          }),
        }),
      } as unknown) as ReturnType<typeof mockSupabase.from>);

      const result = await getTodos();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to load todos. Please try again.");
    });
  });

  describe("createTodo", () => {
    test("successfully creates a new todo", async () => {
      const formData = new FormData();
      formData.append("text", "Buy milk");

      const mockNewTodo = {
        id: "1",
        text: "Buy milk",
        completed: false,
        created_at: "2025-10-28T10:00:00Z",
        updated_at: "2025-10-28T10:00:00Z",
      };

      // Mock для проверки дубликатов
      mockSupabase.from.mockReturnValueOnce(({
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      } as unknown) as ReturnType<typeof mockSupabase.from>);

      // Mock для создания todo
      mockSupabase.from.mockReturnValueOnce(({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockNewTodo,
              error: null,
            }),
          }),
        }),
      } as unknown) as ReturnType<typeof mockSupabase.from>);

      const result = await createTodo(formData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockNewTodo);
    });

    test("prevents creating duplicate todo", async () => {
      const formData = new FormData();
      formData.append("text", "Buy milk");

      // Mock: дубликат найден
      mockSupabase.from.mockReturnValueOnce(({
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockResolvedValue({
            data: [{ text: "Buy milk" }],
            error: null,
          }),
        }),
      } as unknown) as ReturnType<typeof mockSupabase.from>);

      const result = await createTodo(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("This todo already exists!");
    });

    test("validates empty text", async () => {
      const formData = new FormData();
      formData.append("text", "");

      const result = await createTodo(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("cannot be empty");
    });
  });

  describe("updateTodo", () => {
    test("successfully updates todo text", async () => {
      const formData = new FormData();
      formData.append("id", "550e8400-e29b-41d4-a716-446655440000");
      formData.append("text", "Buy bread");

      const mockUpdatedTodo = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        text: "Buy bread",
        completed: false,
        created_at: "2025-10-28T10:00:00Z",
        updated_at: "2025-10-28T10:00:00Z",
      };

      // Mock для проверки дубликатов
      mockSupabase.from.mockReturnValueOnce(({
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockReturnValue({
            neq: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      } as unknown) as ReturnType<typeof mockSupabase.from>);

      // Mock для обновления
      mockSupabase.from.mockReturnValueOnce(({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockUpdatedTodo,
                error: null,
              }),
            }),
          }),
        }),
      } as unknown) as ReturnType<typeof mockSupabase.from>);

      const result = await updateTodo(formData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedTodo);
    });

    test("successfully toggles todo completion", async () => {
      const formData = new FormData();
      formData.append("id", "550e8400-e29b-41d4-a716-446655440000");
      formData.append("completed", "true");

      const mockUpdatedTodo = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        text: "Buy milk",
        completed: true,
        created_at: "2025-10-28T10:00:00Z",
        updated_at: "2025-10-28T10:00:00Z",
      };

      mockSupabase.from.mockReturnValueOnce(({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockUpdatedTodo,
                error: null,
              }),
            }),
          }),
        }),
      } as unknown) as ReturnType<typeof mockSupabase.from>);

      const result = await updateTodo(formData);

      expect(result.success).toBe(true);
      expect(result.data?.completed).toBe(true);
    });
  });

  describe("deleteTodo", () => {
    test("successfully deletes a todo", async () => {
      const formData = new FormData();
      formData.append("id", "550e8400-e29b-41d4-a716-446655440000");

      mockSupabase.from.mockReturnValue(({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      } as unknown) as ReturnType<typeof mockSupabase.from>);

      const result = await deleteTodo(formData);

      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith("todos");
    });

    test("handles delete error", async () => {
      const formData = new FormData();
      formData.append("id", "550e8400-e29b-41d4-a716-446655440000");

      mockSupabase.from.mockReturnValue(({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: { message: "Delete failed" },
          }),
        }),
      } as unknown) as ReturnType<typeof mockSupabase.from>);

      const result = await deleteTodo(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to delete todo");
    });
  });
});
