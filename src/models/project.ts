import type { ContentStatus } from './content';

export type ProjectPlatform = 'ios' | 'flutter' | 'cross-platform';
export type ProjectKind = 'professional' | 'personal';

export interface ProjectFeatureGroup {
  readonly id: string;
  readonly title: string;
  readonly items: readonly string[];
}

export interface Project {
  readonly id: string;
  readonly title: string;
  readonly summary: string | null;
  readonly implementationNote: string | null;
  readonly kind: ProjectKind;
  readonly statusLabel: string | null;
  readonly platforms: readonly ProjectPlatform[];
  readonly technologies: readonly string[];
  readonly featured: boolean;
  readonly year: number | null;
  readonly contributions: readonly string[];
  readonly featureSectionTitle: string | null;
  readonly featureGroups: readonly ProjectFeatureGroup[];
  readonly screenshotSrc: string | null;
  readonly repoUrl: string | null;
  readonly liveUrl: string | null;
  readonly appStoreUrl: string | null;
  readonly contentStatus: ContentStatus;
}
