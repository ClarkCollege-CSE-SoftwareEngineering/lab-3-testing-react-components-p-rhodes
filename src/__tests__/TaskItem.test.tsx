import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskItem, Task } from "../components/TaskItem";

describe("TaskItem", () => {
  // Helper to create a test task
  const createTask = (overrides: Partial<Task> = {}): Task => ({
    id: "1",
    title: "Test Task",
    completed: false,
    ...overrides,
  });

  describe("rendering", () => {
    it("displays the task title", () => {
      const task = createTask({ title: "Buy groceries" });
      render(TaskItem({ task, onToggle: () => {}, onDelete: () => {} }));

      // Using getByText - appropriate here because the title IS the content users see
      expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    });

    it("shows checkbox as unchecked for incomplete tasks", () => {
      const task = createTask({ completed: false });
      render(TaskItem({ task, onToggle: () => {}, onDelete: () => {} }));

      // Using getByRole with name - the preferred query method
      const checkbox = screen.getByRole("checkbox", {
        name: /mark "test task" as complete/i,
      });
      expect(checkbox).not.toBeChecked();
    });

    it("shows checkbox as checked for completed tasks", () => {
      const task = createTask({ completed: true });
      render(TaskItem({ task, onToggle: () => {}, onDelete: () => {} }));

      const checkbox = screen.getByRole("checkbox", {
        name: /mark "test task" as incomplete/i,
      });
      expect(checkbox).toBeChecked();
    });

    it("applies strikethrough style to completed task title", () => {
      const task = createTask({ completed: true, title: "Completed task" });
      render(TaskItem({ task, onToggle: () => {}, onDelete: () => {} }));

      const label = screen.getByText("Completed task");
      expect(label).toHaveStyle({ textDecoration: "checked" });
    });
  });

  describe("interactions", () => {
    it("calls onToggle with task id when checkbox is clicked", async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const task = createTask({ id: "task-123" });

      render(TaskItem({ task, onToggle, onDelete: () => {} }));

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(onToggle).toHaveBeenCalledTimes(1);
      expect(onToggle).toHaveBeenCalledWith("task-123");
    });

    it("calls onDelete with task id when delete button is clicked", async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      const task = createTask({ id: "task-456", title: "Task to delete" });

      render(TaskItem({ task, onToggle: () => {}, onDelete }));

      // Using getByRole with accessible name
      const deleteButton = screen.getByRole("button", {
        name: /delete "task to delete"/i,
      });
      await user.click(deleteButton);

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith("task-456");
    });
  });
});
