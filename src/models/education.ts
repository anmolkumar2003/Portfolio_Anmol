import type { ContentStatus } from './content';

export type EducationStatus = 'completed' | 'in-progress';

export interface Education {
  readonly id: string;
  readonly institution: string | null;
  readonly institutionStatus: ContentStatus;
  readonly location: string | null;
  readonly credential: string;
  readonly field: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly status: EducationStatus;
}
