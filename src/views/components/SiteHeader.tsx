import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useEffect } from 'react';
import type { SectionId } from '@models';
import { useNavigationViewModel } from '@viewmodels';
import styles from './SiteHeader.module.scss';

interface SiteHeaderProps {
  activeSectionId: SectionId;
  isScrolled: boolean;
  prefersReducedMotion: boolean;
}

export function SiteHeader({
  activeSectionId,
  isScrolled,
  prefersReducedMotion,
}: SiteHeaderProps) {
  const {
    items,
    isMenuOpen,
    toggleMenu,
    closeMenu,
    scrollToSection,
  } = useNavigationViewModel();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [closeMenu]);

  const goTo = (id: SectionId) => {
    scrollToSection(id, prefersReducedMotion || Boolean(reduceMotion));
  };

  return (
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
          type="button"
          className={styles.menuToggle}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            id="mobile-navigation"
            className={styles.mobilePanel}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
          >
            <ul className={styles.mobileList}>
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={item.id === 'contact' ? styles.mobileCta : undefined}
                    onClick={() => goTo(item.id)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className={styles.mobileClose} onClick={closeMenu}>
              Close
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
