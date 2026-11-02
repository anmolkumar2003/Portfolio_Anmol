import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  navigationRepository,
  type INavigationRepository,
} from '@repositories';
import type { SectionId } from '@models';

export function useNavigationViewModel(
  repository: INavigationRepository = navigationRepository,
) {
  const items = useMemo(() => repository.getItems(), [repository]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const openMenu = useCallback(() => {
    setIsMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((open) => !open);
  }, []);

  const scrollToSection = useCallback(
    (id: SectionId, reducedMotion = false) => {
      const element = document.getElementById(id);

      if (!element) {
        return;
      }

      element.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      window.history.replaceState(null, '', `#${id}`);
      setIsMenuOpen(false);
    },
    [],
  );

  return {
    items,
    isMenuOpen,
    openMenu,
    closeMenu,
    toggleMenu,
    scrollToSection,
  };
}
