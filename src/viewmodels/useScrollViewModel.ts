import { useEffect, useState } from 'react';
import {
  navigationRepository,
  type INavigationRepository,
} from '@repositories';
import type { SectionId } from '@models';

export function useScrollViewModel(
  repository: INavigationRepository = navigationRepository,
) {
  const [progress, setProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<SectionId>('home');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => {
      setPrefersReducedMotion(media.matches);
    };

    syncMotion();
    media.addEventListener('change', syncMotion);

    return () => {
      media.removeEventListener('change', syncMotion);
    };
  }, []);

  useEffect(() => {
    const sectionIds = repository.getSectionIds();

    const update = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = scrollable <= 0 ? 0 : window.scrollY / scrollable;
      setProgress(Math.min(1, Math.max(0, nextProgress)));
      setIsScrolled(window.scrollY > 12);

      const offset = 96;
      let current: SectionId = 'home';

      for (const id of sectionIds) {
        const element = document.getElementById(id);

        if (!element) {
          continue;
        }

        if (element.getBoundingClientRect().top - offset <= 0) {
          current = id;
        }
      }

      setActiveSectionId(current);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    const hash = window.location.hash.replace('#', '');
    if (hash && sectionIds.includes(hash as SectionId)) {
      document.getElementById(hash)?.scrollIntoView();
    }

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [repository]);

  return {
    progress,
    isScrolled,
    activeSectionId,
    prefersReducedMotion,
  };
}
