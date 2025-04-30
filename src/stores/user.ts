import { writable } from 'svelte/store';

export interface User {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
}

export const currentUser = writable<User | null>(null);
