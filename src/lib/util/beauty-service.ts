import { env } from './env';

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const normalizePath = (path: string): string => (path.startsWith('/') ? path : `/${path}`);

export const getBeautyServiceBaseUrl = (): string => trimTrailingSlash(env.beautyServiceUrl);

export const buildBeautyServiceUrl = (path = ''): string => {
  const baseUrl = getBeautyServiceBaseUrl();
  if (!baseUrl) return '';
  if (!path) return baseUrl;
  return `${baseUrl}${normalizePath(path)}`;
};

export const beautyServiceEndpoints = {
  gifJobs: (): string => buildBeautyServiceUrl('/v1/gif/jobs'),
  gifRender: (): string => buildBeautyServiceUrl('/v1/gif/render')
} as const;
