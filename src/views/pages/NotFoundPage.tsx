import { Button } from '@views/components/Button';
import styles from './NotFoundPage.module.scss';

export function NotFoundPage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <p className={`kicker ${styles.code}`}>404</p>
        <h1>Page not found</h1>
        <p>The page you requested is not part of this portfolio.</p>
        <Button href={import.meta.env.BASE_URL}>Back to home</Button>
      </div>
    </main>
  );
}
