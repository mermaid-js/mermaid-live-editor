import type { DiagramModel } from './diagram.model';

export interface AnalysisResultModel {
  id?: string;
  design: DiagramModel;
  development: string;
  landing: string;
  testing: string;
  createdAt: Date;
}
