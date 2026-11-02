import { useExperienceViewModel } from '@viewmodels';
import { FadeIn } from '@views/components/FadeIn';
import { SectionHeading } from '@views/components/SectionHeading';
import styles from './ExperienceSection.module.scss';

export function ExperienceSection() {
  const { entries } = useExperienceViewModel();

  return (
    <section className="section" id="experience" aria-labelledby="experience-heading">
      <div className="container">
        <SectionHeading
          id="experience-heading"
          kicker="Career"
          title="Experience"
          copy="Where I’ve worked, and the iOS training that came before it."
        />
        <div className={styles.timeline}>
          {entries.map((entry, index) => (
            <FadeIn key={entry.id} delay={index * 0.08}>
              <article
                className={`${styles.card} ${entry.kind === 'training' ? styles.training : ''}`}
              >
                <div className={styles.meta}>
                  <span className={styles.kind}>{entry.kindLabel}</span>
                  {entry.isCurrent ? <span className={styles.current}>Present</span> : null}
                </div>
                <h3 className={styles.organization}>{entry.organization}</h3>
                <p className={styles.role}>{entry.currentTitle}</p>
                {entry.periodLabel ? (
                  <p className={styles.period}>{entry.periodLabel}</p>
                ) : null}
                {entry.location ? (
                  <p className={styles.location}>{entry.location}</p>
                ) : null}
                {entry.progressionLabel && entry.roles.length > 1 ? (
                  <div className={styles.progression}>
                    <p className={styles.progressionLabel}>{entry.progressionLabel}</p>
                    <ol className={styles.roles}>
                      {entry.roles.map((role) => (
                        <li key={`${entry.id}-${role.title}`}>
                          <span className={styles.roleTitle}>{role.title}</span>
                          {role.periodLabel ? (
                            <span className={styles.rolePeriod}>{role.periodLabel}</span>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
