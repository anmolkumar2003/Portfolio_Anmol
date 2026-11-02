import { useMemo } from 'react';
import { educationRepository, type IEducationRepository } from '@repositories';
import { formatDateRange } from './formatters';

export function useEducationViewModel(
  repository: IEducationRepository = educationRepository,
) {
  const entries = useMemo(() => {
    return repository.getEducation().map((entry) => ({
      ...entry,
      periodLabel: formatDateRange(entry.startDate, entry.endDate),
      statusLabel:
        entry.status === 'in-progress' ? 'Currently pursuing' : 'Completed',
    }));
  }, [repository]);

  return { entries };
}
