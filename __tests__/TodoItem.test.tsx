import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoItem } from "../components/TodoItem";

describe("TodoItem", () => {
  test("renders todo text", () => {
    render(<TodoItem text="Buy milk" completed={false} />);

    const todoText = screen.getByText("Buy milk");
    expect(todoText).toBeInTheDocument();
  });

  test("shows completed state with line-through", () => {
    render(<TodoItem text="Buy milk" completed={true} />);

    const todoText = screen.getByText("Buy milk");
    expect(todoText).toHaveClass("line-through");
  });

  test("calls onDelete when delete button is clicked", async () => {
    // Arrange - создаем mock функцию
    const handleDelete = jest.fn();

    // Act - рендерим компонент с mock функцией
    render(
      <TodoItem text="Buy milk" completed={false} onDelete={handleDelete} />
    );

    // Находим кнопку Delete и кликаем на нее
    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await userEvent.click(deleteButton);

    // Assert - проверяем, что функция была вызвана
    expect(handleDelete).toHaveBeenCalledTimes(1);
  });

  test("calls onToggle when checkbox is clicked", async () => {
    // Arrange - создаем mock функцию
    const handleToggle = jest.fn();

    // Act - рендерим компонент с mock функцией
    render(
      <TodoItem text="Buy milk" completed={false} onToggle={handleToggle} />
    );

    // Находим чекбокс и кликаем на него
    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);

    // Assert - проверяем, что функция была вызвана
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  test("checkbox is checked when todo is completed", () => {
    render(<TodoItem text="Buy milk" completed={true} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  test("checkbox is unchecked when todo is not completed", () => {
    render(<TodoItem text="Buy milk" completed={false} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });
});
