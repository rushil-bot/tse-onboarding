import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createTask, updateTask } from "src/api/tasks";
import { TaskForm } from "src/components/TaskForm";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { CreateTaskRequest, UpdateTaskRequest, Task } from "src/api/tasks";
import type { TaskFormProps } from "src/components/TaskForm";

const TITLE_INPUT_ID = "task-title-input";
const DESCRIPTION_INPUT_ID = "task-description-input";
const SAVE_BUTTON_ID = "task-save-button";

vi.mock("src/api/tasks", () => ({
  createTask: vi.fn(async (_params: CreateTaskRequest) => Promise.resolve({ success: true })),
  updateTask: vi.fn(async (_params: UpdateTaskRequest) => Promise.resolve({ success: true })),
}));

const mockTask: Task = {
  _id: "task123",
  title: "My task",
  description: "Very important",
  isChecked: false,
  dateCreated: new Date(),
};

function mountComponent(props: TaskFormProps) {
  render(<TaskForm {...props} />);
}

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe("taskForm", () => {
  it("renders create mode", () => {
    mountComponent({ mode: "create" });
    expect(screen.queryByText("New task")).toBeInTheDocument();
  });

  it("renders edit mode", () => {
    mountComponent({
      mode: "edit",
      task: mockTask,
    });
    expect(screen.queryByText("Edit task")).toBeInTheDocument();
    expect(screen.queryByTestId(TITLE_INPUT_ID)).toHaveValue("My task");
    expect(screen.queryByTestId(DESCRIPTION_INPUT_ID)).toHaveValue("Very important");
  });

  it("calls submit handler with edited fields", async () => {
    mountComponent({
      mode: "edit",
      task: mockTask,
    });
    fireEvent.change(screen.getByTestId(TITLE_INPUT_ID), { target: { value: "Updated title" } });
    fireEvent.change(screen.getByTestId(DESCRIPTION_INPUT_ID), {
      target: { value: "Updated description" },
    });
    const saveButton = screen.getByTestId(SAVE_BUTTON_ID);
    fireEvent.click(saveButton);
    expect(updateTask).toHaveBeenCalledTimes(1);
    expect(updateTask).toHaveBeenCalledWith({
      _id: mockTask._id,
      title: "Updated title",
      description: "Updated description",
      isChecked: mockTask.isChecked,
      assignee: "",
      dateCreated: mockTask.dateCreated, // <--- This line fixes the error
    });
    await waitFor(() => {
      expect(saveButton).toBeEnabled();
    });
  });

  it("catches invalid title", async () => {
    mountComponent({ mode: "create" });
    const saveButton = screen.getByTestId(SAVE_BUTTON_ID);
    fireEvent.click(saveButton);
    expect(createTask).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(saveButton).toBeEnabled();
    });
  });
});
