export const notify = (message: string): void => {
  alert(message);
};

export const prompt = (message: string): boolean => {
  return confirm(message);
};
