import styles from './PendingNote.module.scss';

interface PendingNoteProps {
  children: string;
}

export function PendingNote({ children }: PendingNoteProps) {
  return <p className={styles.note}>{children}</p>;
}
