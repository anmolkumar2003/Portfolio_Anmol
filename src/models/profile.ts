export interface SocialLinks {
  readonly github: string;
  readonly linkedin: string;
}

export interface AboutContent {
  readonly paragraphs: readonly string[];
  readonly focusAreas: readonly string[];
}

export interface Profile {
  readonly name: string;
  readonly role: string;
  readonly shortRole: string;
  readonly headline: string;
  readonly description: string;
  readonly location: string;
  readonly email: string;
  readonly phone: string;
  readonly availability: string;
  readonly techLabels: readonly string[];
  readonly resumeUrl: string | null;
  readonly social: SocialLinks;
  readonly about: AboutContent;
}
