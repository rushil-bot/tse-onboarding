import { Dialog } from "@tritonse/tse-constellation";
import { useState } from "react";
import { createTask, type Task, updateTask } from "src/api/tasks";
import { Button, TextField } from "src/components";
import styles from "src/components/TaskForm.module.css";

export type TaskFormProps = {
  mode: "create" | "edit";
  task?: Task;
  onSubmit?: (task: Task) => void;
};

type TaskFormErrors = {
  title?: boolean;
};

export function TaskForm({ mode, task, onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState<string>(task?.title || "");
  const [description, setDescription] = useState<string>(task?.description || "");
  const [assigneeId, setAssigneeId] = useState<string>(task?.assignee?._id || "");
  const [isLoading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [errorModalMessage, setErrorModalMessage] = useState<string | null>(null);

  const handleSubmit = () => {
    setErrors({});
    if (title.length === 0) {
      setErrors({ title: true });
      return;
    }
    setLoading(true);

    if (mode === "create") {
      createTask({ title, description, assignee: assigneeId })
        .then((result) => {
          if (result.success) {
            setTitle("");
            setDescription("");
            setAssigneeId("");
            if (onSubmit) onSubmit(result.data);
          } else {
            setErrorModalMessage(result.error);
          }
          setLoading(false);
        })
        .catch(setErrorModalMessage);
    } else {
      updateTask({
        _id: task!._id,
        title,
        description,
        assignee: assigneeId,
        dateCreated: task!.dateCreated,
        isChecked: task!.isChecked,
      })
        .then((result) => {
          if (result.success) {
            if (onSubmit) onSubmit(result.data);
          } else {
            setErrorModalMessage(result.error);
          }
          setLoading(false);
        })
        .catch(setErrorModalMessage);
    }
  };

  const formTitle = mode === "create" ? "New task" : "Edit task";

  return (
    <form className={styles.form}>
      <span className={styles.formTitle}>{formTitle}</span>

      {/* Row 1: Title & Description - Matches PDF Page 6 Top Row */}
      <div className={styles.formRow}>
        <TextField
          className={styles.textField}
          data-testid="task-title-input"
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          error={errors.title}
        />
        <TextField
          className={`${styles.textField} ${styles.stretch}`}
          data-testid="task-description-input"
          label="Description (optional)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      {/* Row 2: Assignee & Save - Matches PDF Page 6 Bottom Row */}
      <div className={styles.formRow}>
        <TextField
          className={styles.textField}
          data-testid="task-assignee-input"
          label="Assignee ID (optional)"
          value={assigneeId}
          onChange={(event) => setAssigneeId(event.target.value)}
        />
        <Button
          kind="primary"
          data-testid="task-save-button"
          label="Save"
          disabled={isLoading}
          onClick={handleSubmit}
        />
      </div>

      <Dialog
        styleVersion="styled"
        variant="error"
        title="An error occurred"
        content={<p className={styles.errorModalText}>{errorModalMessage}</p>}
        isOpen={errorModalMessage !== null}
        onClose={() => setErrorModalMessage(null)}
      />
    </form>
  );
}
