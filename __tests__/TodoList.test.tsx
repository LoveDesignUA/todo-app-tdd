import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoList } from "../components/TodoList";

describe("TodoList", () => {
  // Helper функции для уменьшения дублирования кода
  const getInput = () => screen.getByPlaceholderText(/add a new todo/i);
  const getAddButton = () => screen.getByRole("button", { name: /add/i });

  const addTodo = async (text: string) => {
    const input = getInput();
    const addButton = getAddButton();

    await userEvent.type(input, text);
    await userEvent.click(addButton);
  };

  test("renders empty state message when no todos", () => {
    render(<TodoList />);

    const emptyMessage = screen.getByText(/no todos yet/i);
    expect(emptyMessage).toBeInTheDocument();
  });

  test("renders list of todos", async () => {
    render(<TodoList />);

    // Используем helper функцию
    await addTodo("Buy milk");

    // Проверяем, что задача появилась
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
  });

  test("adds a new todo when form is submitted", async () => {
    render(<TodoList />);

    // Используем helper функцию
    await addTodo("Write tests");

    // Проверяем, что задача добавлена
    expect(screen.getByText("Write tests")).toBeInTheDocument();

    // Проверяем, что input очищен
    const input = getInput();
    expect(input).toHaveValue("");
  });

  test("does not add empty todo", async () => {
    render(<TodoList />);

    const addButton = getAddButton();

    // Пытаемся добавить пустую задачу
    await userEvent.click(addButton);

    // Проверяем, что сообщение "No todos yet" все еще отображается
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });

  test("toggles todo completion", async () => {
    render(<TodoList />);

    // Используем helper функцию
    await addTodo("Buy milk");

    // Находим чекбокс и кликаем на него
    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);

    // Проверяем, что чекбокс отмечен
    expect(checkbox).toBeChecked();

    // Проверяем, что текст зачеркнут
    const todoText = screen.getByText("Buy milk");
    expect(todoText).toHaveClass("line-through");
  });

  test("deletes a todo", async () => {
    render(<TodoList />);

    // Используем helper функцию
    await addTodo("Buy milk");

    // Проверяем, что задача существует
    expect(screen.getByText("Buy milk")).toBeInTheDocument();

    // Удаляем задачу
    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await userEvent.click(deleteButton);

    // Проверяем, что задача удалена
    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument();
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });

  test("adds todo by pressing Enter key", async () => {
    render(<TodoList />);

    const input = getInput();

    // Вводим текст и нажимаем Enter
    await userEvent.type(input, "Buy milk{Enter}");

    // Проверяем, что задача добавлена
    expect(screen.getByText("Buy milk")).toBeInTheDocument();

    // Проверяем, что input очищен
    expect(input).toHaveValue("");
  });

  test("manages multiple todos independently", async () => {
    render(<TodoList />);

    // Добавляем несколько задач
    await addTodo("Buy milk");
    await addTodo("Write tests");
    await addTodo("Walk dog");

    // Проверяем, что все задачи отображаются
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(screen.getByText("Write tests")).toBeInTheDocument();
    expect(screen.getByText("Walk dog")).toBeInTheDocument();

    // Отмечаем только вторую задачу
    const checkboxes = screen.getAllByRole("checkbox");
    await userEvent.click(checkboxes[1]); // Write tests

    // Проверяем, что только вторая задача зачеркнута
    expect(screen.getByText("Buy milk")).not.toHaveClass("line-through");
    expect(screen.getByText("Write tests")).toHaveClass("line-through");
    expect(screen.getByText("Walk dog")).not.toHaveClass("line-through");

    // Удаляем первую задачу
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    await userEvent.click(deleteButtons[0]);

    // Проверяем, что удалена только первая
    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument();
    expect(screen.getByText("Write tests")).toBeInTheDocument();
    expect(screen.getByText("Walk dog")).toBeInTheDocument();
  });

  test("prevents adding duplicate todos", async () => {
    render(<TodoList />);

    // Добавляем первую задачу
    await addTodo("Buy milk");
    expect(screen.getByText("Buy milk")).toBeInTheDocument();

    // Пытаемся добавить дубликат
    await addTodo("Buy milk");

    // Проверяем, что задача "Buy milk" встречается только один раз
    const todos = screen.getAllByText("Buy milk");
    expect(todos).toHaveLength(1);
  });

  test("shows error message when trying to add duplicate", async () => {
    render(<TodoList />);

    // Добавляем задачу
    await addTodo("Buy milk");

    // Пытаемся добавить дубликат
    const input = getInput();
    await userEvent.type(input, "Buy milk");
    const addButton = getAddButton();
    await userEvent.click(addButton);

    // Проверяем, что показывается сообщение об ошибке
    expect(screen.getByText(/already exists/i)).toBeInTheDocument();
  });

  test("allows editing a todo", async () => {
    render(<TodoList />);

    // Добавляем задачу
    await addTodo("Buy milk");

    // Находим кнопку редактирования и кликаем
    const editButton = screen.getByRole("button", { name: /edit/i });
    await userEvent.click(editButton);

    // Находим input для редактирования
    const editInput = screen.getByDisplayValue("Buy milk");

    // Очищаем и вводим новый текст
    await userEvent.clear(editInput);
    await userEvent.type(editInput, "Buy bread");

    // Сохраняем изменения
    const saveButton = screen.getByRole("button", { name: /save/i });
    await userEvent.click(saveButton);

    // Проверяем, что текст изменился
    expect(screen.getByText("Buy bread")).toBeInTheDocument();
    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument();
  });

  test("cancels editing when cancel button is clicked", async () => {
    render(<TodoList />);

    // Добавляем задачу
    await addTodo("Buy milk");

    // Начинаем редактирование
    const editButton = screen.getByRole("button", { name: /edit/i });
    await userEvent.click(editButton);

    // Изменяем текст
    const editInput = screen.getByDisplayValue("Buy milk");
    await userEvent.clear(editInput);
    await userEvent.type(editInput, "Buy bread");

    // Отменяем редактирование
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await userEvent.click(cancelButton);

    // Проверяем, что текст НЕ изменился
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(screen.queryByText("Buy bread")).not.toBeInTheDocument();
  });

  test("filters todos to show only active", async () => {
    render(<TodoList />);

    // Добавляем несколько задач
    await addTodo("Buy milk");
    await addTodo("Write tests");
    await addTodo("Walk dog");

    // Отмечаем одну задачу как выполненную
    const checkboxes = screen.getAllByRole("checkbox");
    await userEvent.click(checkboxes[0]); // Buy milk

    // Кликаем на фильтр Active
    const activeFilter = screen.getByRole("button", { name: /active/i });
    await userEvent.click(activeFilter);

    // Проверяем, что видны только невыполненные задачи
    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument();
    expect(screen.getByText("Write tests")).toBeInTheDocument();
    expect(screen.getByText("Walk dog")).toBeInTheDocument();
  });

  test("prevents saving empty text when editing", async () => {
    render(<TodoList />);

    await addTodo("Buy milk");

    // Начинаем редактирование
    const editButton = screen.getByRole("button", { name: /edit/i });
    await userEvent.click(editButton);

    // Очищаем текст
    const editInput = screen.getByDisplayValue("Buy milk");
    await userEvent.clear(editInput);

    // Пытаемся сохранить пустое значение
    const saveButton = screen.getByRole("button", { name: /save/i });
    await userEvent.click(saveButton);

    // Проверяем, что показывается ошибка и режим редактирования активен
    expect(screen.getByText(/cannot be empty/i)).toBeInTheDocument();
    // Проверяем, что input всё ещё виден (режим редактирования)
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  test("prevents duplicate name when editing", async () => {
    render(<TodoList />);

    await addTodo("Buy milk");
    await addTodo("Write tests");

    // Начинаем редактирование первой задачи
    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    await userEvent.click(editButtons[0]);

    // Меняем на имя, которое уже существует
    const editInput = screen.getByDisplayValue("Buy milk");
    await userEvent.clear(editInput);
    await userEvent.type(editInput, "Write tests");

    // Пытаемся сохранить
    const saveButton = screen.getByRole("button", { name: /save/i });
    await userEvent.click(saveButton);

    // Проверяем, что показывается ошибка
    expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    // Проверяем, что режим редактирования активен
    expect(screen.getByDisplayValue("Write tests")).toBeInTheDocument();
  });

  test("shows error when editing to duplicate name", async () => {
    render(<TodoList />);

    await addTodo("Buy milk");
    await addTodo("Write tests");

    // Начинаем редактирование
    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    await userEvent.click(editButtons[0]);

    // Меняем на дубликат
    const editInput = screen.getByDisplayValue("Buy milk");
    await userEvent.clear(editInput);
    await userEvent.type(editInput, "Write tests");
    const saveButton = screen.getByRole("button", { name: /save/i });
    await userEvent.click(saveButton);

    // Проверяем, что показывается сообщение об ошибке
    expect(screen.getByText(/already exists/i)).toBeInTheDocument();
  });

  test("filters todos to show only completed", async () => {
    render(<TodoList />);

    // Добавляем несколько задач
    await addTodo("Buy milk");
    await addTodo("Write tests");

    // Отмечаем одну задачу как выполненную
    const checkboxes = screen.getAllByRole("checkbox");
    await userEvent.click(checkboxes[0]); // Buy milk

    // Кликаем на фильтр Completed
    const completedFilter = screen.getByRole("button", { name: /completed/i });
    await userEvent.click(completedFilter);

    // Проверяем, что видна только выполненная задача
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(screen.queryByText("Write tests")).not.toBeInTheDocument();
  });

  test("shows all todos when All filter is selected", async () => {
    render(<TodoList />);

    // Добавляем задачи
    await addTodo("Buy milk");
    await addTodo("Write tests");

    // Отмечаем одну как выполненную
    const checkboxes = screen.getAllByRole("checkbox");
    await userEvent.click(checkboxes[0]);

    // Переключаемся на Active
    const activeFilter = screen.getByRole("button", { name: /active/i });
    await userEvent.click(activeFilter);

    // Возвращаемся на All
    const allFilter = screen.getByRole("button", { name: /^all$/i });
    await userEvent.click(allFilter);

    // Проверяем, что видны все задачи
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(screen.getByText("Write tests")).toBeInTheDocument();
  });

  // A11y тесты
  test("focuses input when entering edit mode", async () => {
    render(<TodoList />);

    await addTodo("Buy milk");

    // Начинаем редактирование
    const editButton = screen.getByRole("button", { name: /edit/i });
    await userEvent.click(editButton);

    // Проверяем, что фокус на input
    const editInput = screen.getByDisplayValue("Buy milk");
    expect(editInput).toHaveFocus();
  });

  test("returns focus to edit button after canceling edit", async () => {
    render(<TodoList />);

    await addTodo("Buy milk");

    // Начинаем редактирование
    const editButton = screen.getByRole("button", { name: /edit/i });
    await userEvent.click(editButton);

    // Отменяем редактирование
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await userEvent.click(cancelButton);

    // Проверяем, что фокус вернулся на кнопку Edit
    const editButtonAfter = screen.getByRole("button", { name: /edit/i });
    expect(editButtonAfter).toHaveFocus();
  });

  test("returns focus to edit button after saving", async () => {
    render(<TodoList />);

    await addTodo("Buy milk");

    const editButton = screen.getByRole("button", { name: /edit/i });
    await userEvent.click(editButton);

    // Изменяем текст
    const editInput = screen.getByDisplayValue("Buy milk");
    await userEvent.clear(editInput);
    await userEvent.type(editInput, "Buy bread");

    // Сохраняем
    const saveButton = screen.getByRole("button", { name: /save/i });
    await userEvent.click(saveButton);

    // Проверяем, что фокус вернулся на кнопку Edit
    const editButtonAfter = screen.getByRole("button", { name: /edit/i });
    expect(editButtonAfter).toHaveFocus();
  });

  test("error messages have aria-live for screen readers", async () => {
    render(<TodoList />);

    await addTodo("Buy milk");

    // Пытаемся добавить дубликат
    const input = getInput();
    await userEvent.type(input, "Buy milk");
    const addButton = getAddButton();
    await userEvent.click(addButton);

    // Проверяем, что область с ошибкой имеет aria-live
    const errorElement = screen.getByText(/already exists/i).closest("div");
    expect(errorElement).toHaveAttribute("role", "alert");
  });

  test("active filter button has aria-current", async () => {
    render(<TodoList />);

    await addTodo("Buy milk");

    // Проверяем, что кнопка All имеет aria-current="page"
    const allFilter = screen.getByRole("button", { name: /^all$/i });
    expect(allFilter).toHaveAttribute("aria-current", "page");

    // Переключаемся на Active
    const activeFilter = screen.getByRole("button", { name: /active/i });
    await userEvent.click(activeFilter);

    // Проверяем, что активный фильтр имеет aria-current
    expect(activeFilter).toHaveAttribute("aria-current", "page");
    expect(allFilter).not.toHaveAttribute("aria-current");
  });
});
