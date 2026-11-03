import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useRef } from 'react';
import { analyticsEvents } from '@models';
import { analyticsRepository } from '@repositories';
import { useContactViewModel, useProfileViewModel } from '@viewmodels';
import { Button } from '@views/components/Button';
import { DeviceMockup } from '@views/components/DeviceMockup';
import styles from './HeroSection.module.scss';

export function HeroSection() {
  const { profile, hasResume, resumeUrl, resumeFileName, trackResumeDownloadClick } =
    useProfileViewModel();
  const { trackContactClick } = useContactViewModel();

  const trackHeroProjectsClick = () => {
    analyticsRepository.track(analyticsEvents.projectInteraction, {
      action: 'hero_cta',
    });
  };
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 28]);
  const deviceY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -40]);
  const layerY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 50]);

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.04,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 22, rotateX: 8 },
    show: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section className={styles.hero} id="home" aria-labelledby="home-heading" ref={heroRef}>
      <motion.div className={styles.depthA} style={{ y: layerY }} aria-hidden="true" />
      <motion.div className={styles.depthB} style={{ y: copyY }} aria-hidden="true" />
      <div className={`container ${styles.grid}`}>
        <motion.div style={{ y: copyY }}>
        <motion.div
          className={styles.copy}
          style={{ transformPerspective: 900 }}
          variants={reduceMotion ? undefined : container}
          initial={reduceMotion ? undefined : 'hidden'}
          animate={reduceMotion ? undefined : 'show'}
        >
          <motion.div className={styles.meta} variants={reduceMotion ? undefined : item}>
            <span className={styles.pill}>{profile.availability}</span>
            <span className={styles.pill}>
              <MapPin size={14} aria-hidden="true" />
              {profile.location}
            </span>
          </motion.div>
          <motion.p className="kicker" variants={reduceMotion ? undefined : item}>
            {profile.shortRole}
          </motion.p>
          <motion.h1
            id="home-heading"
            className={styles.headline}
            variants={reduceMotion ? undefined : item}
          >
            {profile.headline}
          </motion.h1>
          <motion.p className={styles.description} variants={reduceMotion ? undefined : item}>
            {profile.description}
          </motion.p>
          <motion.ul className={styles.labels} variants={reduceMotion ? undefined : item}>
            {profile.techLabels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </motion.ul>
          <motion.div className={styles.actions} variants={reduceMotion ? undefined : item}>
            <Button href="#projects" onClick={trackHeroProjectsClick}>
              Explore My Work
            </Button>
            <Button
              href="#contact"
              variant="secondary"
              onClick={() => trackContactClick('hero_cta')}
            >
              Contact Me
            </Button>
            {hasResume && resumeUrl ? (
              <Button
                href={resumeUrl}
                variant="secondary"
                download={resumeFileName}
                onClick={trackResumeDownloadClick}
              >
                Download Resume
              </Button>
            ) : null}
          </motion.div>
        </motion.div>
        </motion.div>
        <motion.div style={{ y: deviceY }} className={styles.device}>
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, rotateY: -12, scale: 0.97 }}
          animate={reduceMotion ? undefined : { opacity: 1, rotateY: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          <DeviceMockup
            title={profile.name}
            screenId="hero"
            size="lg"
            floating
            interactive
          />
        </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
