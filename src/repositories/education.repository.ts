import { educationData } from '@data';
import type { Education } from '@models';

export interface IEducationRepository {
  getEducation(): readonly Education[];
}

export class EducationRepository implements IEducationRepository {
  public getEducation(): readonly Education[] {
    return educationData;
  }
}

export const educationRepository = new EducationRepository();
