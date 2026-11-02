import { useMemo } from 'react';
import { skillRepository, type ISkillRepository } from '@repositories';

export function useSkillsViewModel(
  repository: ISkillRepository = skillRepository,
) {
  const groups = useMemo(() => repository.getGroups(), [repository]);

  return { groups };
}
