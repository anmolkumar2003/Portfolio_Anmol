import {
  Code2,
  Layers,
  Smartphone,
  Wrench,
  Workflow,
} from 'lucide-react';
import type { SkillCategory } from '@models';
import { useSkillsViewModel } from '@viewmodels';
import { FadeIn } from '@views/components/FadeIn';
import { SectionHeading } from '@views/components/SectionHeading';
import styles from './SkillsSection.module.scss';

const icons: Record<SkillCategory, typeof Smartphone> = {
  'native-ios': Smartphone,
  'cross-platform': Code2,
  architecture: Layers,
  backend: Workflow,
  tools: Wrench,
};

export function SkillsSection() {
  const { groups } = useSkillsViewModel();

  return (
    <section className="section" id="skills" aria-labelledby="skills-heading">
      <div className="container">
        <SectionHeading
          id="skills-heading"
          kicker="Stack"
          title="Skills"
          copy="The tools and patterns I actually use on iOS and Flutter."
        />
        <div className={styles.grid}>
          {groups.map((group, index) => {
            const Icon = icons[group.id];

            return (
              <FadeIn key={group.id} delay={index * 0.04}>
                <article className={styles.card}>
                  <div className={styles.cardHeader}>
                    <Icon size={16} aria-hidden="true" />
                    <h3>{group.title}</h3>
                  </div>
                  <ul className={styles.list}>
                    {group.skills.map((skill) => (
                      <li key={skill.id}>{skill.name}</li>
                    ))}
                  </ul>
                </article>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
