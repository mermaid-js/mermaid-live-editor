import type { AnalysisResultModel } from './analysisResult.model';

export interface ProjectModel {
  id?: string;
  name: string;
  description: string;
  type: 'web' | 'mobile' | 'iot' | 'desktop';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  analysisResultModel: AnalysisResultModel;
}
