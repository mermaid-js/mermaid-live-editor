import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { LoadingState } from '$lib/types';

const defaultLoading: LoadingState = {
  loading: false
};

export const loadingStateStore: Writable<LoadingState> = writable(defaultLoading);
export const initLoading = async <T>(message: string, task: Promise<T>): Promise<T> => {
  loadingStateStore.set({
    loading: true,
    message
  });
  const result: T = await task;
  loadingStateStore.set({
    loading: false
  });
  return result;
};
