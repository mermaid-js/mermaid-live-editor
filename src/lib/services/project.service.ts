import type { ProjectModel } from '$/models/project.model';
import { getCurrentUser } from '$/firebase/firebase.client';
import { env } from '$/util/env';

export class ProjectService {
  async getUserProject(projectId: string): Promise<ProjectModel | undefined> {
    console.log('Fetching project from API...', env.API_BASE_URL);
    const currentUser = await getCurrentUser();
    if (!currentUser || !projectId) {
      console.error('User authentication and Project ID are required');
      return undefined;
    }

    try {
      const response = await fetch(`${env.API_BASE_URL}/projects/${projectId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Project not found');
          return undefined;
        }
        console.error('Error getting project from API:', response.statusText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const projectData = await response.json();
      return projectData as ProjectModel;
    } catch (error) {
      console.error('Error getting project:', error);
      throw error;
    }
  }

  async getAllUserProjects(): Promise<ProjectModel[]> {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      console.log('User not signed in');
      return [];
    }

    try {
      const response = await fetch(`${env.API_BASE_URL}/projects`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Error getting projects from API:', response.statusText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const projects = await response.json();
      return projects as ProjectModel[];
    } catch (error) {
      console.error('Error while fetching projects:', error);
      throw error;
    }
  }
}

export const projectService = new ProjectService();
