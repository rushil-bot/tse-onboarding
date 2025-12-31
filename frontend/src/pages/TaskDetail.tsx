import { Dialog } from "@tritonse/tse-constellation";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTask, type Task } from "src/api/tasks";
import { Button, Page, TaskForm, UserTag } from "src/components";
import styles from "src/pages/TaskDetail.module.css";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "full",
  timeStyle: "short",
});

export function TaskDetail() {
  const [task, setTask] = useState<Task | null>(null);
  const [errorModalMessage, setErrorModalMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getTask(id)
        .then((result) => {
          if (result.success) {
            setTask(result.data);
          } else {
            setErrorModalMessage(result.error);
          }
        })
        .catch(setErrorModalMessage);
    }
  }, [id]);

  useEffect(() => {
    if (task) {
      document.title = `${task.title} | TSE Todos`;
    }
  }, [task]);

  if (!task) {
    return (
      <Page>
        <p>Loading...</p>
      </Page>
    );
  }

  // Matches PDF Page 6 logic: Show form when editing
  if (isEditing) {
    return (
      <Page>
        <TaskForm
          mode="edit"
          task={task}
          onSubmit={(updatedTask) => {
            setTask(updatedTask);
            setIsEditing(false);
          }}
        />
      </Page>
    );
  }

  return (
    <Page>
      <p>
        <Link to="/">Back to home</Link>
      </p>

      <div className={styles.textContainer}>
        {/* Title Row Matches PDF Page 5 */}
        <div className={styles.item}>
          <span className={styles.taskTitle}>{task.title}</span>
          <div className={styles.taskButton}>
            <Button
              kind="primary"
              data-testid="task-edit-button"
              label="Edit"
              onClick={() => setIsEditing(true)}
            />
          </div>
        </div>

        <div className={styles.item}>
          <p className={styles.description}>
            {task.description ? task.description : "(No Description)"}
          </p>
        </div>

        <div className={styles.assingeeItem}>
          <span className={styles.assingeeLabel}>Assignee</span>
          <UserTag user={task.assignee} />
        </div>

        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Status</span>
          <span>{task.isChecked ? "Done" : "Not Done"}</span>
        </div>

        <div className={styles.dateItem}>
          <span className={styles.dateLabel}>Date Created</span>
          <span>{dateFormatter.format(new Date(task.dateCreated))}</span>
        </div>
      </div>

      <Dialog
        styleVersion="styled"
        variant="error"
        title="An error occurred"
        content={<p className={styles.errorModalText}>{errorModalMessage}</p>}
        isOpen={errorModalMessage !== null}
        onClose={() => setErrorModalMessage(null)}
      />
    </Page>
  );
}
