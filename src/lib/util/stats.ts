// Analytics fully disabled for privacy. All exports are no-ops.

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const initAnalytics = async (): Promise<void> => {};

export const countLines = (code: string): number => {
  return (code.match(/\n/g)?.length ?? 0) + 1;
};

export const saveStatistics = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _args: {
    code: string;
    renderTime: number;
    isRough: boolean;
    diagramType?: string;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
): void => {};

export type AnalyticsEvent = string;

export const logEvent = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _name: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _data?: Record<string, string | number | boolean>
  // eslint-disable-next-line @typescript-eslint/no-empty-function
): void => {};

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
export const logMermaidChartClick = (_source: string): void => {};
