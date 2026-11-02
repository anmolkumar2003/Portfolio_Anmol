import { useCallback, useMemo, useState } from 'react';
import { profileRepository, type IProfileRepository } from '@repositories';

export function useContactViewModel(
  repository: IProfileRepository = profileRepository,
) {
  const profile = useMemo(() => repository.getProfile(), [repository]);
  const [copied, setCopied] = useState(false);

  const phoneHref = `tel:${profile.phone.replace(/\s+/g, '')}`;
  const mailHref = `mailto:${profile.email}`;

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }, [profile.email]);

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
  };
}
