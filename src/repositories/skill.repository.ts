import { skillGroupsData } from '@data';
import type { Skill, SkillGroup } from '@models';

export interface ISkillRepository {
  getGroups(): readonly SkillGroup[];
  getSkills(): readonly Skill[];
}

export class SkillRepository implements ISkillRepository {
  public getGroups(): readonly SkillGroup[] {
    return skillGroupsData;
  }

  public getSkills(): readonly Skill[] {
    return skillGroupsData.flatMap((group) => group.skills);
  }
}

export const skillRepository = new SkillRepository();
