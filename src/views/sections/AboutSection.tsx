import { useProfileViewModel } from '@viewmodels';
import { FadeIn } from '@views/components/FadeIn';
import { SectionHeading } from '@views/components/SectionHeading';
import styles from './AboutSection.module.scss';

export function AboutSection() {
  const { profile } = useProfileViewModel();

  return (
    <section className="section" id="about" aria-labelledby="about-heading">
      <div className="container">
        <SectionHeading
          id="about-heading"
          kicker="About"
          title="About me"
        />
        <div className={styles.grid}>
          <FadeIn>
            <div className={styles.copy}>
              {profile.about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.08}>
            <ul className={styles.focus}>
              {profile.about.focusAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
