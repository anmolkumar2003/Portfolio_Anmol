import { useCallback, useMemo, useState } from 'react';
import { analyticsEvents, type Project, type ProjectPlatform } from '@models';
import {
  analyticsRepository,
  projectRepository,
  type IProjectRepository,
} from '@repositories';
import { formatPlatform } from './formatters';

export const projectFilters = [
  { id: 'all', label: 'All' },
  { id: 'flutter', label: 'Flutter' },
  { id: 'ios', label: 'iOS' },
] as const;

export type ProjectFilterId = (typeof projectFilters)[number]['id'];

function hasCaseStudy(project: Project): boolean {
  return project.featureGroups.length > 0 || project.contributions.length > 0;
}

export function useProjectsViewModel(
  repository: IProjectRepository = projectRepository,
) {
  const [activeFilter, setActiveFilter] = useState<ProjectFilterId>('all');

  const projects = useMemo(() => repository.getProjects(), [repository]);

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') {
      return projects;
    }

    const platform: ProjectPlatform = activeFilter;

    return projects.filter((project) => project.platforms.includes(platform));
  }, [activeFilter, projects]);

  const caseStudies = useMemo(
    () => filteredProjects.filter(hasCaseStudy),
    [filteredProjects],
  );

  const compactProjects = useMemo(
    () => filteredProjects.filter((project) => !hasCaseStudy(project)),
    [filteredProjects],
  );

  const platformLabel = useCallback((platform: string) => {
    return formatPlatform(platform);
  }, []);

  const chipLabels = useCallback((project: Project) => {
    const platforms = project.platforms.map((platform) => formatPlatform(platform));
    const seen = new Set(platforms.map((label) => label.toLowerCase()));
    const technologies = project.technologies.filter(
      (technology) => !seen.has(technology.toLowerCase()),
    );

    return [...platforms, ...technologies];
  }, []);

  const kindLabel = useCallback((project: Project) => {
    return project.kind === 'personal' ? 'Personal' : 'Professional';
  }, []);

  const selectFilter = useCallback((id: ProjectFilterId) => {
    setActiveFilter(id);
    analyticsRepository.track(analyticsEvents.projectInteraction, {
      action: 'filter',
      filter: id,
    });
  }, []);

  const trackAppStoreClick = useCallback((projectTitle: string) => {
    analyticsRepository.track(analyticsEvents.appStoreClick, {
      project: projectTitle,
    });
  }, []);

  const trackHeroProjectsClick = useCallback(() => {
    analyticsRepository.track(analyticsEvents.projectInteraction, {
      action: 'hero_cta',
    });
  }, []);

  return {
    projects,
    filteredProjects,
    caseStudies,
    compactProjects,
    filters: projectFilters,
    activeFilter,
    setActiveFilter: selectFilter,
    hasProjects: projects.length > 0,
    platformLabel,
    chipLabels,
    kindLabel,
    trackAppStoreClick,
    trackHeroProjectsClick,
  };
}
