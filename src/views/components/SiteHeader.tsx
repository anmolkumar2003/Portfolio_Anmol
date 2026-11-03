import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import type { SectionId } from '@models';
import { useNavigationViewModel } from '@viewmodels';
import styles from './SiteHeader.module.scss';

interface SiteHeaderProps {
  activeSectionId: SectionId;
  isScrolled: boolean;
}

export function SiteHeader({ activeSectionId, isScrolled }: SiteHeaderProps) {
  const {
    items,
    isMenuOpen,
    toggleMenu,
    closeMenu,
    scrollToSection,
  } = useNavigationViewModel();
  const reduceMotion = useReducedMotion();
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeReasonRef = useRef<'toggle' | 'escape' | 'navigate' | 'outside' | null>(
    null,
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        closeReasonRef.current = 'escape';
        closeMenu();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [closeMenu, isMenuOpen]);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const onChange = () => {
      if (media.matches && isMenuOpen) {
        closeReasonRef.current = 'outside';
        closeMenu();
      }
    };

    media.addEventListener('change', onChange);
    return () => {
      media.removeEventListener('change', onChange);
    };
  }, [closeMenu, isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      if (panelRef.current) {
        panelRef.current.scrollTop = 0;
      }

      const firstLink = panelRef.current?.querySelector<HTMLButtonElement>(
        '[data-mobile-link]',
      );
      firstLink?.focus();
      return;
    }

    if (
      closeReasonRef.current === 'toggle' ||
      closeReasonRef.current === 'escape' ||
      closeReasonRef.current === 'outside'
    ) {
      toggleRef.current?.focus();
    }

    closeReasonRef.current = null;
  }, [isMenuOpen]);

  const goTo = (id: SectionId) => {
    closeReasonRef.current = 'navigate';
    scrollToSection(id, Boolean(reduceMotion));
  };

  const onToggle = () => {
    if (isMenuOpen) {
      closeReasonRef.current = 'toggle';
    }
    toggleMenu();
  };

  const onBackdropClick = () => {
    closeReasonRef.current = 'outside';
    closeMenu();
  };

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.inner}`}>
          <a className={styles.brand} href="#home" onClick={() => goTo('home')}>
            Anmol Kumar
          </a>
          <nav className={styles.desktopNav} aria-label="Primary">
            <ul className={styles.navList}>
              {items.map((item) => {
                const isContact = item.id === 'contact';
                const isActive = activeSectionId === item.id;

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`${styles.navButton} ${isContact ? styles.cta : ''} ${isActive ? styles.active : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => goTo(item.id)}
                    >
                      {!isContact && isActive ? (
                        <motion.span
                          className={styles.activePill}
                          layoutId={reduceMotion ? undefined : 'nav-active'}
                          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        />
                      ) : null}
                      <span className={styles.navLabel}>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          <button
            ref={toggleRef}
            type="button"
            className={`${styles.menuToggle} ${isMenuOpen ? styles.menuToggleOpen : ''}`}
            aria-expanded={isMenuOpen}
            aria-controls={menuId}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={onToggle}
          >
            {isMenuOpen ? (
              <X size={22} aria-hidden="true" />
            ) : (
              <Menu size={22} aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            key="mobile-menu"
            className={styles.mobileOverlay}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className={styles.mobileBackdrop}
              aria-label="Close menu"
              tabIndex={-1}
              onClick={onBackdropClick}
            />
            <nav
              ref={panelRef}
              id={menuId}
              className={styles.mobilePanel}
              aria-label="Mobile navigation"
              data-mobile-nav-scroll=""
            >
              <ul className={styles.mobileList}>
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      data-mobile-link=""
                      className={
                        item.id === 'contact' ? styles.mobileCta : styles.mobileLink
                      }
                      onClick={() => goTo(item.id)}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
