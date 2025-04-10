import { doc, getDoc } from 'firebase/firestore';
import type { ProjectModel } from '$/models/project.model';
import type { AnalysisResultModel } from '$/models/analysisResult.model';
import db from '$/firebase/firebase.client';

export class ProjectService {
  /**
   * Récupère un projet spécifique d'un utilisateur
   * @param userId ID de l'utilisateur
   * @param projectId ID du projet
   * @returns Le projet ou undefined si non trouvé
   */
  async getUserProject(userId: string, projectId: string): Promise<ProjectModel | undefined> {
    if (!userId || !projectId) {
      console.error('User ID and Project ID are required');
      return undefined;
    }

    try {
      const projectReference = doc(db, `users/${userId}/projects/${projectId}`);

      const projectSnap = await getDoc(projectReference);

      if (!projectSnap.exists()) {
        console.log('Project not found');
        return undefined;
      }

      const projectData = projectSnap.data();
      return {
        analysisResultModel: projectData.analysisResultModel as AnalysisResultModel,
        budgetIntervals: projectData.budgetIntervals as string,
        constraints: projectData.constraints as string[],
        createdAt: projectData.createdAt as Date,
        description: projectData.description as string,
        id: projectSnap.id,
        name: projectData.name as string,
        scope: projectData.scope as string,
        selectedPhases: projectData.selectedPhases as string[],
        targets: projectData.targets as string,
        teamSize: projectData.teamSize as string,
        type: projectData.type as string,
        updatedAt: projectData.updatedAt as Date,
        userId: projectData.userId as string
      } as ProjectModel;
    } catch (error) {
      console.error('Error getting project:', error);
      throw error;
    }
  }
}

export const projectService = new ProjectService();
