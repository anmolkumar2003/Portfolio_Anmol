import { useCallback, useMemo } from 'react';
import { resumeFileName } from '@data';
import { analyticsEvents } from '@models';
import { analyticsRepository, profileRepository, type IProfileRepository } from '@repositories';

export function useProfileViewModel(
  repository: IProfileRepository = profileRepository,
) {
  const profile = useMemo(() => repository.getProfile(), [repository]);
  const hasResume = __HAS_RESUME_PDF__;
  const resumeUrl = hasResume
    ? `${import.meta.env.BASE_URL}${resumeFileName}`
    : null;

  const trackResumeDownloadClick = useCallback(() => {
    analyticsRepository.track(analyticsEvents.resumeDownloadClick);
  }, []);

  return {
    profile,
    hasResume,
    resumeUrl,
    resumeFileName,
    trackResumeDownloadClick,
  };
}
