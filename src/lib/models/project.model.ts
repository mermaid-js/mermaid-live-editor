import type { AnalysisResultModel } from './analysisResult.model';

export interface ProjectModel {
  id?: string;
  name: string;
  description: string;
  type: 'web' | 'mobile' | 'iot' | 'desktop';
  constraints: string[];
  teamSize: string;
  scope: string;
  budgetIntervals?: string;
  targets: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  selectedPhases: string[];
  analysisResultModel: AnalysisResultModel;
}
