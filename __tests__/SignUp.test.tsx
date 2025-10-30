import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUpPage from "../app/signup/page";
import { signUp } from "../app/actions/auth";

// Mock Server Action
jest.mock("../app/actions/auth", () => ({
  signUp: jest.fn(async () => ({ success: true })),
}));

describe("SignUp Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders signup form with email and password inputs", () => {
    render(<SignUpPage />);

    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create an account/i })
    ).toBeInTheDocument();
  });

  test("shows validation error for empty email", async () => {
    render(<SignUpPage />);

    const submitButton = screen.getByRole("button", {
      name: /create an account/i,
    });
    await userEvent.click(submitButton);

    expect(screen.getByRole("alert")).toHaveTextContent(/email/i);
  });

  test("shows validation error for invalid email format", async () => {
    render(<SignUpPage />);

    const emailInput = screen.getByLabelText(/^email$/i);
    await userEvent.type(emailInput, "invalid-email");

    const submitButton = screen.getByRole("button", {
      name: /create an account/i,
    });
    await userEvent.click(submitButton);

    expect(screen.getByRole("alert")).toHaveTextContent(/valid email/i);
  });

  test("shows validation error for empty password", async () => {
    render(<SignUpPage />);

    const emailInput = screen.getByLabelText(/^email$/i);
    await userEvent.type(emailInput, "test@example.com");

    const submitButton = screen.getByRole("button", {
      name: /create an account/i,
    });
    await userEvent.click(submitButton);

    expect(screen.getByRole("alert")).toHaveTextContent(/password/i);
  });

  test("shows validation error for short password", async () => {
    render(<SignUpPage />);

    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "123");

    const submitButton = screen.getByRole("button", {
      name: /create an account/i,
    });
    await userEvent.click(submitButton);

    expect(screen.getByRole("alert")).toHaveTextContent(/at least 6/i);
  });

  test("shows validation error when passwords do not match", async () => {
    render(<SignUpPage />);

    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    await userEvent.type(confirmPasswordInput, "password456");

    const submitButton = screen.getByRole("button", {
      name: /create an account/i,
    });
    await userEvent.click(submitButton);

    expect(screen.getByRole("alert")).toHaveTextContent(/do not match/i);
  });

  test("calls signUp action with valid credentials", async () => {
    render(<SignUpPage />);

    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    await userEvent.type(confirmPasswordInput, "password123");

    const submitButton = screen.getByRole("button", {
      name: /create an account/i,
    });
    await userEvent.click(submitButton);

    expect(signUp).toHaveBeenCalledTimes(1);
  });

  test("shows success message after successful signup", async () => {
    render(<SignUpPage />);

    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    await userEvent.type(confirmPasswordInput, "password123");

    const submitButton = screen.getByRole("button", {
      name: /create an account/i,
    });
    await userEvent.click(submitButton);

    expect(
      await screen.findByRole("button", { name: /go to sign in/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/we sent you a confirmation link/i)
    ).toBeInTheDocument();
  });

  test("shows error message when signup fails", async () => {
    (signUp as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: "Email already exists",
    });

    render(<SignUpPage />);

    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    await userEvent.type(confirmPasswordInput, "password123");

    const submitButton = screen.getByRole("button", {
      name: /create an account/i,
    });
    await userEvent.click(submitButton);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /email already exists/i
    );
  });

  test("has link to login page", () => {
    render(<SignUpPage />);

    const loginLink = screen.getByRole("link", { name: /sign in/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });
});
