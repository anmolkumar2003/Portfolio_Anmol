import { useScrollViewModel } from '@viewmodels';
import { ScrollProgress } from '@views/components/ScrollProgress';
import { SiteFooter } from '@views/components/SiteFooter';
import { SiteHeader } from '@views/components/SiteHeader';
import { SkipLink } from '@views/components/SkipLink';
import { AboutSection } from '@views/sections/AboutSection';
import { ContactSection } from '@views/sections/ContactSection';
import { EducationSection } from '@views/sections/EducationSection';
import { ExperienceSection } from '@views/sections/ExperienceSection';
import { HeroSection } from '@views/sections/HeroSection';
import { ProjectsSection } from '@views/sections/ProjectsSection';
import { SkillsSection } from '@views/sections/SkillsSection';

export function HomePage() {
  const { progress, isScrolled, activeSectionId, prefersReducedMotion } =
    useScrollViewModel();

  return (
    <>
      <SkipLink />
      <ScrollProgress progress={progress} />
      <SiteHeader
        activeSectionId={activeSectionId}
        isScrolled={isScrolled}
        prefersReducedMotion={prefersReducedMotion}
      />
      <main id="main">
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ExperienceSection />
        <ProjectsSection />
        <EducationSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
