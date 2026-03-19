/** Simple JSON formatting — extracted to avoid circular dependency between state.ts and util.ts */
export const formatJSON = (data: unknown): string => JSON.stringify(data, undefined, 2);
