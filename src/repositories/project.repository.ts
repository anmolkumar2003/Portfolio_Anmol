import { projectsData } from '@data';
import type { Project } from '@models';

export interface IProjectRepository {
  getProjects(): readonly Project[];
  getFeaturedProjects(): readonly Project[];
  getProjectById(id: string): Project | undefined;
}

export class ProjectRepository implements IProjectRepository {
  public getProjects(): readonly Project[] {
    return projectsData;
  }

  public getFeaturedProjects(): readonly Project[] {
    return projectsData.filter((project) => project.featured);
  }

  public getProjectById(id: string): Project | undefined {
    return projectsData.find((project) => project.id === id);
  }
}

export const projectRepository = new ProjectRepository();
