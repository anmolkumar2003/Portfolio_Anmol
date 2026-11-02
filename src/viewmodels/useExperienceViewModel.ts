import { useMemo } from 'react';
import { experienceRepository, type IExperienceRepository } from '@repositories';
import { formatOptionalDateRange } from './formatters';

export function useExperienceViewModel(
  repository: IExperienceRepository = experienceRepository,
) {
  const entries = useMemo(() => {
    return repository.getExperience().map((entry) => {
      const roles = entry.roles.map((role) => ({
        ...role,
        periodLabel: formatOptionalDateRange(role.startDate, role.endDate),
      }));

      return {
        ...entry,
        periodLabel: formatOptionalDateRange(entry.startDate, entry.endDate),
        kindLabel: entry.kind === 'training' ? 'Training' : 'Employment',
        progressionLabel:
          roles.length > 1 ? roles.map((role) => role.title).join(' → ') : null,
        roles,
        isCurrent: entry.startDate !== null && entry.endDate === null,
      };
    });
  }, [repository]);

  return { entries };
}
