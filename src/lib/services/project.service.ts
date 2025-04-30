import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import type { ProjectModel } from '$/models/project.model';
import type { AnalysisResultModel } from '$/models/analysisResult.model';
import db, { getCurrentUser } from '$/firebase/firebase.client';

export class ProjectService {
  async getUserProject(projectId: string): Promise<ProjectModel | undefined> {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.uid;
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

  async getAllUserProjects(): Promise<ProjectModel[]> {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      console.log('Utilisateur non connecté');
      return [];
    }

    try {
      const projectReference = collection(db, `users/${currentUser.uid}/projects`);
      const snapshot = await getDocs(projectReference);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as ProjectModel[];
    } catch (error) {
      console.error('Erreur lors de la récupération des projets :', error);
      throw error;
    }
  }
}

export const projectService = new ProjectService();
