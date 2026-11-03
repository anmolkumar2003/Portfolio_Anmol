import { useEffect, useState } from 'react';
import {
  navigationRepository,
  type INavigationRepository,
} from '@repositories';
import { isSectionId, type SectionId } from '@models';

export function useScrollViewModel(
  repository: INavigationRepository = navigationRepository,
) {
  const [progress, setProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<SectionId>('home');

  useEffect(() => {
    const sectionIds = repository.getSectionIds();
    let frameId = 0;

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

    const scheduleUpdate = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        update();
      });
    };

    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    const hash = window.location.hash.replace('#', '');
    if (isSectionId(hash) && sectionIds.includes(hash)) {
      document.getElementById(hash)?.scrollIntoView();
    }

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [repository]);

  return {
    progress,
    isScrolled,
    activeSectionId,
  };
}
