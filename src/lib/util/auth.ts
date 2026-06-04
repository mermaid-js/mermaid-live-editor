import { writable } from 'svelte/store';
import { api } from './api';

export interface SessionUser {
  id: string;
  email: string;
  displayName?: string | null;
  isAdmin?: boolean;
}

// `undefined` = not yet loaded, `null` = signed out, object = signed in.
export const sessionStore = writable<SessionUser | null | undefined>(undefined);

export const loadSession = async (): Promise<void> => {
  try {
    sessionStore.set(await api.get<SessionUser>('/auth/me'));
  } catch {
    sessionStore.set(null);
  }
};

/** Full-page redirect into the backend's Entra PKCE login. */
export const login = (): void => {
  window.location.href = '/api/auth/login';
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout', {});
  } catch {
    // Ignore: we clear local session regardless.
  }
  sessionStore.set(null);
};
