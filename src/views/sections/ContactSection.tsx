import { ArrowUpRight, Copy, Mail, Phone } from 'lucide-react';
import { useContactViewModel } from '@viewmodels';
import { Button } from '@views/components/Button';
import { FadeIn } from '@views/components/FadeIn';
import { SectionHeading } from '@views/components/SectionHeading';
import styles from './ContactSection.module.scss';

export function ContactSection() {
  const {
    email,
    phone,
    github,
    linkedin,
    mailHref,
    phoneHref,
    copied,
    copyEmail,
    trackContactClick,
  } = useContactViewModel();

  return (
    <section className="section" id="contact" aria-labelledby="contact-heading">
      <div className="container">
        <SectionHeading
          id="contact-heading"
          kicker="Connect"
          title="Contact"
          copy="Email, phone or LinkedIn — whichever is easiest."
        />
        <FadeIn>
          <ul className={styles.list}>
            <li className={styles.item}>
              <a
                className={styles.link}
                href={mailHref}
                onClick={() => trackContactClick('email')}
              >
                <Mail size={18} aria-hidden="true" />
                <span>{email}</span>
              </a>
              <Button variant="ghost" onClick={() => void copyEmail()} ariaLabel="Copy email address">
                <Copy size={16} aria-hidden="true" />
                {copied ? 'Copied' : 'Copy email'}
              </Button>
            </li>
            <li className={styles.item}>
              <a
                className={styles.link}
                href={phoneHref}
                onClick={() => trackContactClick('phone')}
              >
                <Phone size={18} aria-hidden="true" />
                <span>{phone}</span>
              </a>
            </li>
            <li className={styles.item}>
              <a
                className={styles.link}
                href={github}
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => trackContactClick('github')}
              >
                GitHub
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </li>
            <li className={styles.item}>
              <a
                className={styles.link}
                href={linkedin}
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => trackContactClick('linkedin')}
              >
                LinkedIn
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </li>
          </ul>
          <p className={`visually-hidden ${styles.copy}`} aria-live="polite">
            {copied ? 'Email address copied to clipboard.' : ''}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
