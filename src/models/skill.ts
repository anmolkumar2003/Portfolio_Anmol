export type SkillCategory =
  | 'native-ios'
  | 'cross-platform'
  | 'architecture'
  | 'backend'
  | 'tools';

export interface Skill {
  readonly id: string;
  readonly name: string;
  readonly category: SkillCategory;
}

export interface SkillGroup {
  readonly id: SkillCategory;
  readonly title: string;
  readonly skills: readonly Skill[];
}
