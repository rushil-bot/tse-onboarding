import { Dialog } from "@tritonse/tse-constellation";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTask, type Task } from "src/api/tasks";
import { Button, Page } from "src/components";
import styles from "src/pages/TaskDetail.module.css";

// Define the date formatter outside the component to avoid recreating it on every render
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "full",
  timeStyle: "short",
});

export function TaskDetail() {
  const [task, setTask] = useState<Task | null>(null);
  const [errorModalMessage, setErrorModalMessage] = useState<string | null>(null);
  const { id } = useParams();

  // 1. Fetch the task data
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

  // 2. Update the document title dynamically when the task loads
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

  return (
    <Page>
      {/* Link to home*/}
      <p>
        <Link to="/">Back to home</Link>
      </p>

      <div className={styles.textContainer}>
        <div className={styles.item}>
          {/*Title of task */}
          <span className={styles.taskTitle}>{task.title}</span>

          {/*Edit button*/}
          <div className={styles.taskButton}>
            <Button kind="primary" data-testid="task-edit-button" label="Edit" />
          </div>
        </div>

        <div className={styles.item}>
          {/*Description*/}
          <p className={styles.description}>
            {task.description ? task.description : "(No Description)"}
          </p>
        </div>

        {/*Assignee information */}
        <div className={styles.assingeeItem}>
          <span className={styles.assingeeLabel}>Assignee</span>
          <img src="/userIcon.svg" alt="User Icon" className={styles.assingeeIcon} />
          <span className={styles.assingeeName}>
            User Name Very Long Very Long Very Long Very Long...
          </span>
        </div>

        {/*Status Information */}
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Status</span>
          <span>{task.isChecked ? "Done" : "Not Done"}</span>
        </div>

        {/*Date Created Information */}
        <div className={styles.dateItem}>
          <span className={styles.dateLabel}>Date Created</span>
          {/* Use the formatter on the task.dateCreated object */}
          <span>{dateFormatter.format(task.dateCreated)}</span>
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
