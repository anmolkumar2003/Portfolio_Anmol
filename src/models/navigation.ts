export type SectionId =
  | 'home'
  | 'about'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'education'
  | 'contact';

export interface NavItem {
  readonly id: SectionId;
  readonly label: string;
  readonly href: string;
}
