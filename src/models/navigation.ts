export type SectionId =
  | 'home'
  | 'about'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'education'
  | 'contact';

const SECTION_IDS: readonly SectionId[] = [
  'home',
  'about',
  'skills',
  'experience',
  'projects',
  'education',
  'contact',
] as const;

export function isSectionId(value: string): value is SectionId {
  return (SECTION_IDS as readonly string[]).includes(value);
}

export interface NavItem {
  readonly id: SectionId;
  readonly label: string;
  readonly href: string;
}
