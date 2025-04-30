export interface DiagramModel {
  useCaseDiagram: {
    content: string;
    summary: string;
  };
  classDiagram: {
    content: string;
    summary: string;
  };
  erDiagram: {
    content: string;
    summary: string;
  };
  sequenceDiagram: {
    content: string;
    summary: string;
  };
  architectureDiagram: {
    content: string;
    summary: string;
  };
}
