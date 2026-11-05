import { useCallback, useMemo } from 'react';
import { resumeFileName } from '@data';
import { analyticsEvents } from '@models';
import {
  analyticsRepository,
  pageAnalyticsRepository,
  profileRepository,
  type IProfileRepository,
} from '@repositories';

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
    void pageAnalyticsRepository.increment('downloads');
  }, []);

  return {
    profile,
    hasResume,
    resumeUrl,
    resumeFileName,
    trackResumeDownloadClick,
  };
}
