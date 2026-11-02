export type ExperienceKind = 'employment' | 'training';

export interface ExperienceRole {
  readonly title: string;
  readonly startDate: string | null;
  readonly endDate: string | null;
}

export interface Experience {
  readonly id: string;
  readonly organization: string;
  readonly kind: ExperienceKind;
  readonly location: string | null;
  readonly startDate: string | null;
  readonly endDate: string | null;
  readonly currentTitle: string;
  readonly roles: readonly ExperienceRole[];
}
