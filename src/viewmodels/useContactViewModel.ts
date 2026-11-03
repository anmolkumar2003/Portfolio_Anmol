import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { analyticsEvents } from '@models';
import {
  analyticsRepository,
  profileRepository,
  type IProfileRepository,
} from '@repositories';

export function useContactViewModel(
  repository: IProfileRepository = profileRepository,
) {
  const profile = useMemo(() => repository.getProfile(), [repository]);
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  const phoneHref = `tel:${profile.phone.replace(/\s+/g, '')}`;
  const mailHref = `mailto:${profile.email}`;

  const trackContactClick = useCallback((channel: string) => {
    analyticsRepository.track(analyticsEvents.contactClick, { channel });
  }, []);

  const copyEmail = useCallback(async () => {
    trackContactClick('copy_email');

    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);

      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }

      copiedTimeoutRef.current = window.setTimeout(() => {
        copiedTimeoutRef.current = null;
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }, [profile.email, trackContactClick]);

  return {
    email: profile.email,
    phone: profile.phone,
    github: profile.social.github,
    linkedin: profile.social.linkedin,
    location: profile.location,
    phoneHref,
    mailHref,
    copied,
    copyEmail,
    trackContactClick,
  };
}
