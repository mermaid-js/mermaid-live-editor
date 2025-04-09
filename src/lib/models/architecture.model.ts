export interface ArchitectureModel {
  id?: string;
  projectId: string;
  type: 'basic' | 'recommended' | 'complex';
  description: string;
  technologies: {
    backend: string[];
    frontend: string[];
    database: string[];
    cloud: string[];
  };
  createdAt: Date;
}
