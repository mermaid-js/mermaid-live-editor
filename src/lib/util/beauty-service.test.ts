import { describe, expect, it, vi } from 'vitest';

const loadModule = async () => import('./beauty-service');

describe('beauty service url helpers', () => {
  it('builds gif endpoints from configured base url', async () => {
    vi.resetModules();
    vi.stubEnv('MERMAID_BEAUTY_SERVICE_URL', 'http://127.0.0.1:2400/');

    const module = await loadModule();

    expect(module.getBeautyServiceBaseUrl()).toBe('http://127.0.0.1:2400');
    expect(module.buildBeautyServiceUrl('/v1/gif/render')).toBe(
      'http://127.0.0.1:2400/v1/gif/render'
    );
    expect(module.beautyServiceEndpoints.gifJobs()).toBe('http://127.0.0.1:2400/v1/gif/jobs');

    vi.unstubAllEnvs();
  });

  it('returns empty strings when the base url is not configured', async () => {
    vi.resetModules();
    vi.stubEnv('MERMAID_BEAUTY_SERVICE_URL', '');

    const module = await loadModule();

    expect(module.getBeautyServiceBaseUrl()).toBe('');
    expect(module.buildBeautyServiceUrl('/v1/gif/render')).toBe('');
    expect(module.beautyServiceEndpoints.gifRender()).toBe('');

    vi.unstubAllEnvs();
  });
});
