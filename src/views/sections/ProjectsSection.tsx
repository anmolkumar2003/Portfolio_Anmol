import {
  Cloud,
  Images,
  Printer,
  ShieldCheck,
  Sparkles,
  Store,
  Wifi,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import type { Project } from '@models';
import { useProjectsViewModel } from '@viewmodels';
import { DeviceMockup } from '@views/components/DeviceMockup';
import { FadeIn } from '@views/components/FadeIn';
import { SectionHeading } from '@views/components/SectionHeading';
import { TiltCard } from '@views/components/TiltCard';
import styles from './ProjectsSection.module.scss';

const featureIcons: Record<string, LucideIcon> = {
  authentication: ShieldCheck,
  gallery: Images,
  printing: Printer,
  creative: Sparkles,
  connectivity: Wifi,
  storage: Cloud,
  accounts: ShieldCheck,
  home: Images,
  details: Sparkles,
  navigation: Wifi,
  stack: Cloud,
};

function AppStoreLink({
  url,
  projectTitle,
  onTrack,
}: {
  url: string | null;
  projectTitle: string;
  onTrack: (projectTitle: string) => void;
}) {
  if (!url) {
    return null;
  }

  return (
    <a
      className={styles.storeLink}
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      onClick={() => onTrack(projectTitle)}
    >
      <Store size={16} aria-hidden="true" />
      View on App Store
    </a>
  );
}

function ProjectChips({ labels }: { labels: readonly string[] }) {
  if (labels.length === 0) {
    return null;
  }

  return (
    <div className={styles.chips}>
      {labels.map((label, index) => (
        <span
          className={styles.chip}
          key={label}
          style={{ animationDelay: `${String(index * 40)}ms` }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function FeatureGroups({ project }: { project: Project }) {
  const reduceMotion = useReducedMotion();

  if (project.featureGroups.length === 0) {
    return null;
  }

  return (
    <div>
      {project.featureSectionTitle ? (
        <h4 className={styles.sectionTitle}>{project.featureSectionTitle}</h4>
      ) : null}
      <div className={styles.featureGrid}>
        {project.featureGroups.map((group, groupIndex) => {
          const Icon = featureIcons[group.id] ?? Sparkles;

          return (
            <motion.article
              className={styles.featureCard}
              key={group.id}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.08 + groupIndex * 0.05,
              }}
            >
              <div className={styles.featureHeader}>
                <Icon size={16} aria-hidden="true" />
                <h5>{group.title}</h5>
              </div>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}

function ProjectMeta({
  kindLabel,
  statusLabel,
}: {
  kindLabel: string;
  statusLabel: string | null;
}) {
  return (
    <div className={styles.meta}>
      <span className={styles.kind}>{kindLabel}</span>
      {statusLabel ? <span className={styles.status}>{statusLabel}</span> : null}
    </div>
  );
}

export function ProjectsSection() {
  const {
    caseStudies,
    compactProjects,
    filters,
    activeFilter,
    setActiveFilter,
    chipLabels,
    kindLabel,
    hasProjects,
    trackAppStoreClick,
  } = useProjectsViewModel();
  const reduceMotion = useReducedMotion();

  return (
    <section className="section" id="projects" aria-labelledby="projects-heading">
      <div className="container">
        <SectionHeading
          id="projects-heading"
          kicker="Work"
          title="Projects"
          copy="A mix of professional iOS work on photo printing products, a Flutter app I built, and a personal project still in development."
        />
        <div className={styles.filters} role="toolbar" aria-label="Filter projects">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`${styles.filter} ${activeFilter === filter.id ? styles.active : ''}`}
              aria-pressed={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        {hasProjects ? (
          <motion.div
            key={activeFilter}
            className={styles.results}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {caseStudies.map((project, index) => (
              <FadeIn key={project.id} delay={index * 0.05} mode="mount">
                <TiltCard>
                <article className={styles.showcase}>
                  <div className={styles.visual}>
                    <DeviceMockup
                      title={project.title}
                      screenshotSrc={project.screenshotSrc}
                      screenId={project.id}
                      size="lg"
                      animated
                    />
                  </div>
                  <div className={styles.details}>
                    <ProjectMeta
                      kindLabel={kindLabel(project)}
                      statusLabel={project.statusLabel}
                    />
                    <h3>{project.title}</h3>
                    {project.summary ? <p>{project.summary}</p> : null}
                    {project.implementationNote ? (
                      <p className={styles.note}>{project.implementationNote}</p>
                    ) : null}
                    <ProjectChips labels={chipLabels(project)} />
                    {project.contributions.length > 0 ? (
                      <div>
                        <h4 className={styles.sectionTitle}>
                          {project.featureSectionTitle ?? 'Key Contributions'}
                        </h4>
                        <ul className={styles.contributionList}>
                          {project.contributions.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <FeatureGroups project={project} />
                    <AppStoreLink
                      url={project.appStoreUrl}
                      projectTitle={project.title}
                      onTrack={trackAppStoreClick}
                    />
                  </div>
                </article>
                </TiltCard>
              </FadeIn>
            ))}
            {compactProjects.length > 0 ? (
              <div className={styles.compactGrid}>
                {compactProjects.map((project, index) => (
                  <FadeIn key={project.id} delay={index * 0.05} mode="mount">
                    <TiltCard>
                    <article className={styles.compactCard}>
                      <DeviceMockup
                        title={project.title}
                        screenshotSrc={project.screenshotSrc}
                        screenId={project.id}
                        size="sm"
                        animated
                      />
                      <div className={styles.compactBody}>
                        <ProjectMeta
                          kindLabel={kindLabel(project)}
                          statusLabel={project.statusLabel}
                        />
                        <h3>{project.title}</h3>
                        {project.summary ? <p>{project.summary}</p> : null}
                        <ProjectChips labels={chipLabels(project)} />
                        <AppStoreLink
                      url={project.appStoreUrl}
                      projectTitle={project.title}
                      onTrack={trackAppStoreClick}
                    />
                      </div>
                    </article>
                    </TiltCard>
                  </FadeIn>
                ))}
              </div>
            ) : null}
          </motion.div>
        ) : (
          <p className={styles.empty}>Project entries will appear here once they are added.</p>
        )}
        {hasProjects && caseStudies.length === 0 && compactProjects.length === 0 ? (
          <p className={styles.empty}>No projects match this filter yet.</p>
        ) : null}
      </div>
    </section>
  );
}
