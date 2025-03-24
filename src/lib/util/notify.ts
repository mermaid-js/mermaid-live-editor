import { toast } from 'svelte-sonner';

export const notify = (message: string): void => {
  toast(message);
};

export const prompt = (message: string): boolean => {
  return confirm(message);
};
