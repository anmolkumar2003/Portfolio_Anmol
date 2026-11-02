import styles from './SectionHeading.module.scss';

interface SectionHeadingProps {
  id: string;
  kicker: string;
  title: string;
  copy?: string;
}

export function SectionHeading({ id, kicker, title, copy }: SectionHeadingProps) {
  return (
    <div className={styles.headingGroup}>
      <p className="kicker">{kicker}</p>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {copy ? <p className={styles.copy}>{copy}</p> : null}
    </div>
  );
}
