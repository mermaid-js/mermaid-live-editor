export interface Documentation {
  id?: string;
  projectId: string;
  content: string;
  diagrams: {
    useCase: string;
    classDiagram: string;
    sequenceDiagram: string;
  };
  createdAt: Date;
}
