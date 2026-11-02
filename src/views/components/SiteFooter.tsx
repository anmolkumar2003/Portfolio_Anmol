import { useProfileViewModel } from '@viewmodels';
import styles from './SiteFooter.module.scss';

export function SiteFooter() {
  const { profile } = useProfileViewModel();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div>
          <p className={styles.brand}>{profile.name}</p>
          <p className={styles.meta}>{profile.shortRole}</p>
        </div>
        <ul className={styles.links}>
          <li>
            <a href={`mailto:${profile.email}`}>Email</a>
          </li>
          <li>
            <a href={profile.social.github} target="_blank" rel="noreferrer noopener">
              GitHub
            </a>
          </li>
          <li>
            <a href={profile.social.linkedin} target="_blank" rel="noreferrer noopener">
              LinkedIn
            </a>
          </li>
        </ul>
        <p className={styles.meta}>© {new Date().getFullYear()} {profile.name}</p>
      </div>
    </footer>
  );
}
