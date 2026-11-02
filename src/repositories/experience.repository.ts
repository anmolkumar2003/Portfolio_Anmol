import { experienceData } from '@data';
import type { Experience } from '@models';

export interface IExperienceRepository {
  getExperience(): readonly Experience[];
}

export class ExperienceRepository implements IExperienceRepository {
  public getExperience(): readonly Experience[] {
    return experienceData;
  }
}

export const experienceRepository = new ExperienceRepository();
