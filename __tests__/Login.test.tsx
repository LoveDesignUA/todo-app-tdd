import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../app/login/page";
import { signIn } from "../app/actions/auth";

// Mock Server Action
jest.mock("../app/actions/auth", () => ({
  signIn: jest.fn(async () => ({ success: true })),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

describe("Login Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders login form with email and password inputs", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  test("shows validation error for empty email", async () => {
    render(<LoginPage />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    expect(screen.getByRole("alert")).toHaveTextContent(/email/i);
  });

  test("shows validation error for invalid email format", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, "invalid-email");

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    expect(screen.getByRole("alert")).toHaveTextContent(/valid email/i);
  });

  test("shows validation error for empty password", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, "test@example.com");

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    expect(screen.getByRole("alert")).toHaveTextContent(/password/i);
  });

  test("shows validation error for short password", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "123");

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    expect(screen.getByRole("alert")).toHaveTextContent(/at least 6/i);
  });

  test("calls signIn action with valid credentials", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    expect(signIn).toHaveBeenCalledTimes(1);
  });

  test("shows error message when sign in fails", async () => {
    (signIn as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: "Invalid credentials",
    });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "wrongpassword");

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /invalid credentials/i
    );
  });

  test("has link to signup page", () => {
    render(<LoginPage />);

    const signupLink = screen.getByRole("link", { name: /sign up/i });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute("href", "/signup");
  });
});
