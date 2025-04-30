// src/stores/user.ts
import { writable } from 'svelte/store';

export interface UserModel {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  subscription: 'free' | 'pro' | 'enterprise';
  createdAt: Date;
  lastLogin: Date;
}

export const currentUser = writable<UserModel | null>(null);
