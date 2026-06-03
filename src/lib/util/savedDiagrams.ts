import { get, writable, type Writable } from 'svelte/store';
import { api } from './api';
import { deserializeState, serializeState } from './serde';
import { inputStateStore } from './state';

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export interface DiagramMeta {
  id: string;
  name: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DiagramFull extends DiagramMeta {
  payload: string;
}

export const foldersStore: Writable<Folder[]> = writable([]);
export const diagramsStore: Writable<DiagramMeta[]> = writable([]);

// The diagram currently loaded from the backend (so "Save" can overwrite it).
export const activeDiagramId: Writable<string | null> = writable(null);

// Controls the "Save as new" dialog (shared between the navbar button and the pane).
export const saveDialogOpen: Writable<boolean> = writable(false);

/** Reload the full folder + diagram lists for the signed-in user. */
export const refreshSavedDiagrams = async (): Promise<void> => {
  const [folders, diagrams] = await Promise.all([
    api.get<Folder[]>('/folders'),
    api.get<DiagramMeta[]>('/diagrams')
  ]);
  foldersStore.set(folders);
  diagramsStore.set(diagrams);
};

export const clearSavedDiagrams = (): void => {
  foldersStore.set([]);
  diagramsStore.set([]);
  activeDiagramId.set(null);
};

// --- Folders ---

export const createFolder = async (name: string, parentId: string | null = null): Promise<void> => {
  await api.post<Folder>('/folders', { name, parentId });
  await refreshSavedDiagrams();
};

export const renameFolder = async (id: string, name: string): Promise<void> => {
  await api.patch<Folder>(`/folders/${id}`, { name });
  await refreshSavedDiagrams();
};

export const moveFolder = async (id: string, parentId: string | null): Promise<void> => {
  await api.patch<Folder>(`/folders/${id}`, { parentId });
  await refreshSavedDiagrams();
};

export const deleteFolder = async (id: string): Promise<void> => {
  await api.delete(`/folders/${id}`);
  await refreshSavedDiagrams();
};

// --- Diagrams ---

const currentPayload = (): string => serializeState(get(inputStateStore));

/** Save the current editor state as a new diagram. */
export const saveCurrentAsNew = async (
  name: string,
  folderId: string | null = null
): Promise<void> => {
  const diagram = await api.post<DiagramMeta>('/diagrams', {
    name,
    folderId,
    payload: currentPayload()
  });
  activeDiagramId.set(diagram.id);
  await refreshSavedDiagrams();
};

/** Overwrite the currently-active diagram with the editor state. */
export const saveActiveDiagram = async (): Promise<boolean> => {
  const id = get(activeDiagramId);
  if (!id) {
    return false;
  }
  await api.patch<DiagramMeta>(`/diagrams/${id}`, { payload: currentPayload() });
  await refreshSavedDiagrams();
  return true;
};

export const renameDiagram = async (id: string, name: string): Promise<void> => {
  await api.patch<DiagramMeta>(`/diagrams/${id}`, { name });
  await refreshSavedDiagrams();
};

export const moveDiagram = async (id: string, folderId: string | null): Promise<void> => {
  await api.patch<DiagramMeta>(`/diagrams/${id}`, { folderId });
  await refreshSavedDiagrams();
};

export const deleteDiagram = async (id: string): Promise<void> => {
  await api.delete(`/diagrams/${id}`);
  if (get(activeDiagramId) === id) {
    activeDiagramId.set(null);
  }
  await refreshSavedDiagrams();
};

/** Load a saved diagram into the editor. */
export const loadDiagram = async (id: string): Promise<void> => {
  const diagram = await api.get<DiagramFull>(`/diagrams/${id}`);
  const state = deserializeState(diagram.payload);
  inputStateStore.set({ ...state, updateDiagram: true });
  activeDiagramId.set(diagram.id);
};
