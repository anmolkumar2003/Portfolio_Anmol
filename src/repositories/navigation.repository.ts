import { navigationItems } from '@data';
import type { NavItem, SectionId } from '@models';

export interface INavigationRepository {
  getItems(): readonly NavItem[];
  getSectionIds(): readonly SectionId[];
}

export class NavigationRepository implements INavigationRepository {
  public getItems(): readonly NavItem[] {
    return navigationItems;
  }

  public getSectionIds(): readonly SectionId[] {
    return navigationItems.map((item) => item.id);
  }
}

export const navigationRepository = new NavigationRepository();
