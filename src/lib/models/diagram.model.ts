import type { SectionModel } from "./section.model";

export interface DiagramModel {
  id?: string;
  title?: string;
  createdAt?: Date;
  updatedAt?: Date;
  content?: string; // New content property for step-based generation
  sections?: SectionModel[]; // Made optional for backward compatibility
}
