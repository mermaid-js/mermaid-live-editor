export interface ScriptModel {
  id?: string;
  architectureId: string;
  os: 'windows' | 'macos' | 'linux';
  content: string;
  createdAt: Date;
}
