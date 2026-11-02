import { profileData } from '@data';
import type { Profile } from '@models';

export interface IProfileRepository {
  getProfile(): Profile;
}

export class ProfileRepository implements IProfileRepository {
  public getProfile(): Profile {
    return profileData;
  }
}

export const profileRepository = new ProfileRepository();
