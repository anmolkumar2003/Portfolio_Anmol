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
    if (!isMenuOpen) {
      return;
    }

    const { body, documentElement } = document;
    const previous = {
      htmlOverflow: documentElement.style.overflow,
      bodyOverscroll: body.style.overscrollBehavior,
      htmlOverscroll: documentElement.style.overscrollBehavior,
    };

    // Lock scroll on <html> only. Setting overflow:hidden on <body> while the
    // page is scrolled makes position:sticky treat the header as in-flow at the
    // document top — so the header (and X toggle) leave the viewport while the
    // fixed menu overlay stays. Do not use body position:fixed either.
    documentElement.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    documentElement.style.overscrollBehavior = 'none';

    const preventTouchScroll = (event: TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        event.preventDefault();
        return;
      }

      const scrollRegion = target.closest('[data-mobile-nav-scroll]');
      if (!scrollRegion) {
        event.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventTouchScroll, { passive: false });

    return () => {
      document.removeEventListener('touchmove', preventTouchScroll);
      documentElement.style.overflow = previous.htmlOverflow;
      body.style.overscrollBehavior = previous.bodyOverscroll;
      documentElement.style.overscrollBehavior = previous.htmlOverscroll;
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

  const scrollToSection = useCallback((id: SectionId, reducedMotion = false) => {
    setIsMenuOpen(false);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const element = document.getElementById(id);
        if (!element) {
          return;
        }

        element.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
        window.history.replaceState(null, '', `#${id}`);
      });
    });
  }, []);

  return {
    items,
    isMenuOpen,
    openMenu,
    closeMenu,
    toggleMenu,
    scrollToSection,
  };
}
