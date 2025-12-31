import styles from "src/components/UserTag.module.css";

import type { User } from "src/api/users";

export type UserTagProps = {
  user?: User;
};

export function UserTag({ user }: UserTagProps) {
  if (!user) {
    // Verified against PDF Page 1 : Lowercase 'a'
    return <span className={styles.noUserMessage}>Not assigned</span>;
  }
  let profilePicUrl = "/userIcon.svg";
  if (user?.profilePictureURL) {
    profilePicUrl = user.profilePictureURL;
  }
  return (
    <div className={styles.assingeeItem}>
      <img src={profilePicUrl} alt="User Icon" className={styles.assingeeIcon} />
      <span className={styles.assingeeName}>{user.name}</span>
    </div>
  );
}
