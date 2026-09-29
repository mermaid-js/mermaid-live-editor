import type { LoadingState } from '$lib/types';

export const loadingState = $state<LoadingState>({ loading: false });

export const initLoading = async <T>(message: string, task: Promise<T>): Promise<T> => {
  loadingState.loading = true;
  loadingState.message = message;
  try {
    return await task;
  } finally {
    loadingState.loading = false;
    loadingState.message = undefined;
  }
};
