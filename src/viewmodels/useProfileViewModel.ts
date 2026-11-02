import { useMemo } from 'react';
import { profileRepository, type IProfileRepository } from '@repositories';

export function useProfileViewModel(
  repository: IProfileRepository = profileRepository,
) {
  const profile = useMemo(() => repository.getProfile(), [repository]);

  return {
    profile,
    hasResume: profile.resumeUrl !== null,
    resumeUrl: profile.resumeUrl,
  };
}
