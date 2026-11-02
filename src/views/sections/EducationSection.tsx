import { useEducationViewModel } from '@viewmodels';
import { FadeIn } from '@views/components/FadeIn';
import { SectionHeading } from '@views/components/SectionHeading';
import styles from './EducationSection.module.scss';

export function EducationSection() {
  const { entries } = useEducationViewModel();

  return (
    <section className="section" id="education" aria-labelledby="education-heading">
      <div className="container">
        <SectionHeading
          id="education-heading"
          kicker="Studies"
          title="Education"
        />
        <div className={styles.grid}>
          {entries.map((entry, index) => (
            <FadeIn key={entry.id} delay={index * 0.06}>
              <article
                className={`${styles.card} ${entry.status === 'in-progress' ? styles.current : ''}`}
              >
                <span
                  className={`${styles.badge} ${entry.status === 'in-progress' ? styles.progress : styles.completed}`}
                >
                  {entry.statusLabel}
                </span>
                <h3>{entry.credential}</h3>
                {entry.institution ? <p>{entry.institution}</p> : null}
                {entry.location ? <p className={styles.location}>{entry.location}</p> : null}
                <p className={styles.period}>{entry.periodLabel}</p>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
