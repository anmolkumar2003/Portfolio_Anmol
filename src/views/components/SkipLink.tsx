import styles from './SkipLink.module.scss';

export function SkipLink() {
  return (
    <a className={styles.link} href="#main">
      Skip to content
    </a>
  );
}
