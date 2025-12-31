import { Dialog } from "@tritonse/tse-constellation";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { type Task, updateTask } from "src/api/tasks";
import { CheckButton, UserTag } from "src/components";
import styles from "src/components/TaskItem.module.css";

export type TaskItemProps = {
  task: Task;
};

export function TaskItem({ task: initialTask }: TaskItemProps) {
  const [task, setTask] = useState<Task>(initialTask);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [errorModalMessage, setErrorModalMessage] = useState<string | null>(null);

  const handleToggleCheck = () => {
    setLoading(true);
    updateTask({ ...task, isChecked: !task.isChecked })
      .then((result) => {
        if (result.success) {
          setTask(result.data);
        } else {
          setErrorModalMessage(result.error);
        }
        setLoading(false);
      })
      .catch(setErrorModalMessage);
  };

  let textContainer = styles.textContainer;
  if (task.isChecked) {
    textContainer += " ";
    textContainer += styles.checked;
  }
  return (
    <div className={styles.item}>
      <CheckButton checked={task.isChecked} onPress={handleToggleCheck} disabled={isLoading} />
      <div className={styles.contentContainer}>
        <div className={textContainer}>
          <span className={styles.title}>
            <Link to={`/task/${task._id}`}>{task.title}</Link>
          </span>
          {task.description && <span className={styles.description}>{task.description}</span>}
        </div>
        <div className={styles.userTagContainer}>
          <UserTag user={task.assignee} />
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
    </div>
  );
}
