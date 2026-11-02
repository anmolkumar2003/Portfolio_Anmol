import { motion, useReducedMotion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useProfileViewModel } from '@viewmodels';
import { Button } from '@views/components/Button';
import { DeviceMockup } from '@views/components/DeviceMockup';
import styles from './HeroSection.module.scss';

export function HeroSection() {
  const { profile, hasResume, resumeUrl } = useProfileViewModel();
  const reduceMotion = useReducedMotion();

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
    hidden: { opacity: 0, y: 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section className={styles.hero} id="home" aria-labelledby="home-heading">
      <div className={`container ${styles.grid}`}>
        <motion.div
          className={styles.copy}
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
            <Button href="#projects">Explore My Work</Button>
            <Button href="#contact" variant="secondary">
              Contact Me
            </Button>
            {hasResume && resumeUrl ? (
              <Button href={resumeUrl} variant="secondary">
                Download Resume
              </Button>
            ) : null}
          </motion.div>
        </motion.div>
        <motion.div
          className={styles.device}
          initial={reduceMotion ? undefined : { opacity: 0, y: 28, scale: 0.97 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          <DeviceMockup title={profile.name} size="lg" />
        </motion.div>
      </div>
    </section>
  );
}
