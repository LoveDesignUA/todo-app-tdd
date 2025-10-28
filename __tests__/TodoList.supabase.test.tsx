import { render, screen } from "@testing-library/react";
import { TodoListServer } from "../components/TodoListServer";

// Mock Server Action getTodos used by the server component
jest.mock("../app/actions/todos", () => ({
  getTodos: jest.fn(),
}));

// Mock next/navigation used inside client child to avoid router invariant
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ replace: jest.fn() })),
  usePathname: jest.fn(() => "/"),
  useSearchParams: jest.fn(() => ({ toString: () => "" })),
}));

import { getTodos } from "../app/actions/todos";

describe("TodoListServer (server component)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders todos from getTodos", async () => {
    (getTodos as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        {
          id: "11111111-1111-1111-1111-111111111111",
          text: "Buy milk",
          completed: false,
          created_at: "2025-10-28T10:00:00Z",
          updated_at: "2025-10-28T10:00:00Z",
        },
        {
          id: "22222222-2222-2222-2222-222222222222",
          text: "Write tests",
          completed: true,
          created_at: "2025-10-28T09:00:00Z",
          updated_at: "2025-10-28T09:00:00Z",
        },
      ],
    });

    const ui = await TodoListServer();
    render(ui);

    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(screen.getByText("Write tests")).toBeInTheDocument();
  });

  test("renders empty state when no todos", async () => {
    (getTodos as jest.Mock).mockResolvedValue({ success: true, data: [] });

    const ui = await TodoListServer();
    render(ui);

    expect(
      screen.getByText(/no todos yet\. add one above!/i)
    ).toBeInTheDocument();
  });

  test("renders error alert when getTodos fails", async () => {
    (getTodos as jest.Mock).mockResolvedValue({
      success: false,
      error: "Failed to load todos",
    });

    const ui = await TodoListServer();
    render(ui);

    expect(screen.getByRole("alert")).toHaveTextContent(
      /failed to load todos/i
    );
  });

  test("applies filter from URL", async () => {
    (getTodos as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        {
          id: "11111111-1111-1111-1111-111111111111",
          text: "Buy milk",
          completed: false,
          created_at: "2025-10-28T10:00:00Z",
          updated_at: "2025-10-28T10:00:00Z",
        },
        {
          id: "22222222-2222-2222-2222-222222222222",
          text: "Write tests",
          completed: true,
          created_at: "2025-10-28T09:00:00Z",
          updated_at: "2025-10-28T09:00:00Z",
        },
      ],
    });

    const ui = await TodoListServer({ initialFilter: "completed" });
    render(ui);

    expect(screen.getByText("Write tests")).toBeInTheDocument();
    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument();
  });
});
